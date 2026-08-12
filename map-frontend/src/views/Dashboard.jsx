import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NuevoProyecto from '../components/NuevoProyecto';
import api from '../api/axiosInstance';

const Dashboard = () => {
  const [proyectos, setProyectos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const usuarioString = localStorage.getItem('usuario');
  const usuario = usuarioString ? JSON.parse(usuarioString) : null;

  useEffect(() => {
    let isMounted = true;

    const cargarProyectos = async () => {
      try {
        setLoading(true);
        const response = await api.get('/proyectos');
        const data = response.data;

        if (!isMounted) return;

        if (Array.isArray(data)) {
          setProyectos(data);
        } else if (data && Array.isArray(data.data)) {
          setProyectos(data.data);
        } else if (data && Array.isArray(data.proyectos)) {
          setProyectos(data.proyectos);
        } else {
          setProyectos([]);
        }
        setError('');

      } catch (err) {
        if (!isMounted) return;

        const mensaje = err.response?.data?.message || err.response?.data?.error || err.message;
        setError(mensaje || 'Error al conectar con el servidor.');

        if (err.response?.status === 401 || err.response?.status === 403 || mensaje?.includes("Token")) {
          localStorage.clear();
          navigate('/');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    cargarProyectos();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleProyectoCreado = (nuevoProyecto) => {
    setProyectos((prevProyectos) => [nuevoProyecto, ...prevProyectos]);
  };

  return (
    <div className="min-h-screen bg-[#0B0A0F] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        
        {/* Encabezado Principal */}
        <div className="flex justify-between items-center mb-8 border-b border-[#2D2845] pb-4">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#22C55E]">
              🚀 MAP PMO - DASHBOARD
            </h1>
            {usuario && (
              <p className="text-[#94A3B8] text-sm mt-1">
                Bienvenido de vuelta, <span className="text-[#A855F7] font-bold">{usuario.nombre || usuario.correo}</span>
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs bg-gradient-to-r from-[#A855F7] to-[#7C3AED] hover:from-[#9333EA] hover:to-[#6D28D9] text-white font-bold px-4 py-2 rounded-lg transition-all shadow-lg"
            >
              + Nueva Iniciativa
            </button>
            <button 
              onClick={handleLogout}
              className="text-xs bg-[#EF4444]/20 border border-[#EF4444]/40 hover:bg-[#EF4444] text-white px-4 py-2 rounded-lg transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171] p-4 rounded-xl text-sm mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Renderizado de Proyectos */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-[#94A3B8] text-center">Cargando iniciativas...</p>
          </div>
        ) : proyectos.length === 0 ? (
          <div className="text-center py-16 bg-[#13111C] border border-[#2D2845] rounded-xl">
            <p className="text-[#94A3B8] text-sm">No hay iniciativas registradas en el PMO actualmente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proyectos.map((proyecto) => (
              <div 
                key={proyecto.id || proyecto.id_iniciativa} 
                onClick={() => navigate(`/proyectos/${proyecto.id || proyecto.id_iniciativa}`)}
                className="cursor-pointer relative bg-[#13111C] border border-[#2D2845] rounded-xl p-5 shadow-lg hover:border-[#A855F7]/80 hover:scale-[1.01] transition-all duration-300 overflow-hidden"
              >
                <div className="mt-2">
                  <h3 className="text-lg font-bold text-white mb-2">{proyecto.nombre || proyecto.titulo}</h3>
                  <p className="text-xs text-[#94A3B8] line-clamp-3 mb-4">
                    {proyecto.descripcion || 'Sin descripción.'}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] uppercase font-semibold tracking-wider pt-4 border-t border-[#2D2845]">
                  <span className="text-[#94A3B8]">Código: {proyecto.codigo || 'N/A'}</span>
                  
                  <span className={`px-2.5 py-0.5 rounded-full border ${
                    proyecto.estado === 'Aprobado' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30' :
                    proyecto.estado === 'Evaluacion' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    proyecto.estado === 'Caso_de_Negocio' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/30'
                  }`}>
                    {proyecto.estado || 'Idea'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <NuevoProyecto
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProyectoCreado={handleProyectoCreado}
      />
    </div>
  );
};

export default Dashboard;