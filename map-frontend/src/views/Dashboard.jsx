import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NuevoProyecto from '../components/NuevoProyecto'; // Asegúrate de que la ruta sea correcta

const Dashboard = () => {
  const [proyectos, setProyectos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const usuarioString = localStorage.getItem('usuario');
  const usuario = usuarioString ? JSON.parse(usuarioString) : null;

  const cargarProyectos = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("⚠️ Sin token activo. Redirigiendo al Login...");
      navigate('/');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log("📡 Datos crudos que llegaron del backend al Dashboard:", data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error al obtener proyectos del servidor');
      }

      // Tu lógica de validación de arreglos impecable:
      if (Array.isArray(data)) {
        setProyectos(data);
      } else if (data && Array.isArray(data.data)) {
        setProyectos(data.data);
      } else if (data && Array.isArray(data.proyectos)) {
        setProyectos(data.proyectos);
      } else {
        console.warn("⚠️ La respuesta del API no es un arreglo válido:", data);
        setProyectos([]);
      }

    } catch (err) {
      console.error("❌ Falló la carga protegida:", err.message);
      setError(err.message);
      
      if (err.message.includes("Token") || err.message.includes("expirado") || err.message.includes("inválido")) {
        localStorage.clear();
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProyectos();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Esta función inserta el proyecto recién creado arriba en el estado sin recargar la página entera
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
                Bienvenido de vuelta, <span className="text-[#A855F7] font-bold">{usuario.nombre}</span> 
                (Rol ID: <span className="text-[#22C55E] font-bold">{usuario.id_role || usuario.id_rol}</span>)
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            {/* El botón estrella de "+ Nueva Iniciativa" */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs bg-gradient-to-r from-[#A855F7] to-[#7C3AED] hover:from-[#9333EA] hover:to-[#6D28D9] text-white font-bold px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-purple-500/20"
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
          <p className="text-sm text-[#94A3B8] animate-pulse text-center mt-10">
            Consultando iniciativas en el servidor Postgres...
          </p>
        ) : proyectos.length === 0 ? (
          <div className="text-center py-16 bg-[#13111C] border border-[#2D2845] rounded-xl">
            <p className="text-[#94A3B8] text-sm">No hay iniciativas registradas en el PMO actualmente.</p>
            <p className="text-xs text-gray-500 mt-1">¡Presiona "+ Nueva Iniciativa" para crear una!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proyectos.map((proyecto) => (
                <div 
                key={proyecto.id} 
                className="relative bg-[#13111C] border border-[#2D2845] rounded-xl p-5 shadow-lg hover:border-[#A855F7]/50 transition-all duration-300 overflow-hidden"
                >
                {/* Etiqueta superior de "Iniciativa" */}
                <div className="absolute top-0 left-0 bg-[#A855F7]/10 text-[#A855F7] border-b border-r border-[#2D2845] text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-br-lg">
                    📋 Nueva Iniciativa
                </div>

                <div className="mt-4">
                    <h3 className="text-lg font-bold text-white mb-2">{proyecto.nombre}</h3>
                    <p className="text-xs text-[#94A3B8] line-clamp-3 mb-4">
                    {proyecto.descripcion || 'Sin descripción.'}
                    </p>
                </div>

                <div className="flex justify-between items-center text-[10px] uppercase font-semibold tracking-wider pt-4 border-t border-[#2D2845]">
                    <span className="text-[#94A3B8]">Código: {proyecto.codigo || 'N/A'}</span>
                    
                    {/* Badge dinámico según el estado de evaluación */}
                    <span className={`px-2.5 py-0.5 rounded-full border ${
                    proyecto.estado === 'Aprobado' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30' :
                    proyecto.estado === 'Evaluacion' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    proyecto.estado === 'Caso_de_Negocio' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    proyecto.estado === 'Rechazado' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/30' // Para estado "Idea"
                    }`}>
                    {proyecto.estado === 'Caso_de_Negocio' ? 'Caso de Negocio' : 
                    proyecto.estado === 'Evaluacion' ? 'En Evaluación' : 
                    proyecto.estado || 'Idea'}
                    </span>
                </div>
                </div>
            ))}
            </div>
        )}

      </div>

      {/* MODAL DEL FORMULARIO CONECTADO */}
      <NuevoProyecto
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProyectoCreado={handleProyectoCreado}
      />
    </div>
  );
};

export default Dashboard;