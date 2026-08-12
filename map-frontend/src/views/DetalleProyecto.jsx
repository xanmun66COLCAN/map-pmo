import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

const DetalleProyecto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const cargarProyecto = async () => {
      try {
        setLoading(true);
        console.log(`📡 Consultando detalle del proyecto ID: ${id}`);
        
        const response = await api.get(`/proyectos/${id}`);
        const responseData = response.data;

        if (!active) return;

        // Extraer la entidad desde el payload de Express { success: true, data: { ... } }
        const datosProyecto = responseData?.data || responseData;
        setProyecto(datosProyecto);
        setError('');

      } catch (err) {
        if (!active) return;
        console.error("❌ Error al cargar detalle:", err);
        const mensaje = err.response?.data?.message || err.response?.data?.error || err.message;
        setError(mensaje || 'No se pudo obtener la información de la iniciativa.');

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.clear();
          navigate('/');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (id) cargarProyecto();

    return () => {
      active = false;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A0F] text-white flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-[#94A3B8]">Cargando detalle del proyecto desde Postgres...</p>
      </div>
    );
  }

  if (error || !proyecto) {
    return (
      <div className="min-h-screen bg-[#0B0A0F] text-white p-6 flex flex-col items-center justify-center">
        <div className="bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171] p-6 rounded-xl text-center max-w-md shadow-xl">
          <p className="mb-4 text-sm font-semibold">⚠️ {error || 'Iniciativa no encontrada.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#A855F7] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#9333EA] transition-all shadow-lg"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0A0F] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        
        {/* Botón Volver */}
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs text-[#94A3B8] hover:text-white mb-6 flex items-center gap-2 transition-all font-semibold"
        >
          ← Volver al Dashboard
        </button>

        {/* Encabezado Principal */}
        <div className="bg-[#13111C] border border-[#2D2845] rounded-xl p-6 shadow-xl mb-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 pb-4 border-b border-[#2D2845]">
            <div>
              <span className="text-[10px] text-[#A855F7] font-bold uppercase tracking-wider bg-[#A855F7]/10 px-2.5 py-1 rounded-md border border-[#A855F7]/20">
                Código: {proyecto.codigo || 'N/A'}
              </span>
              <h1 className="text-2xl font-black text-white mt-3">{proyecto.nombre || proyecto.titulo}</h1>
            </div>

            <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold border ${
              proyecto.estado === 'Aprobado' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30' :
              proyecto.estado === 'Evaluacion' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
              proyecto.estado === 'Caso_de_Negocio' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
              'bg-gray-500/10 text-gray-400 border-gray-500/30'
            }`}>
              {proyecto.estado === 'Caso_de_Negocio' ? 'Caso de Negocio' : 
               proyecto.estado === 'Evaluacion' ? 'En Evaluación' : 
               proyecto.estado || 'Idea'}
            </span>
          </div>

          <div>
            <h3 className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider mb-2">Descripción General</h3>
            <p className="text-sm text-gray-300 leading-relaxed bg-[#0B0A0F]/50 p-4 rounded-lg border border-[#2D2845]/60">
              {proyecto.descripcion || 'Sin descripción registrada para esta iniciativa.'}
            </p>
          </div>
        </div>

        {/* Métricas y Datos del Proyecto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl">
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold block mb-1">Líder del Proyecto</span>
            <span className="text-sm font-semibold text-white">{proyecto.lider_proyecto || 'No asignado'}</span>
          </div>

          <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl">
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold block mb-1">Departamento</span>
            <span className="text-sm font-semibold text-white">{proyecto.departamento || 'General'}</span>
          </div>

          <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl">
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold block mb-1">Presupuesto</span>
            <span className="text-sm font-bold text-[#22C55E]">
              ${Number(proyecto.presupuesto || 0).toLocaleString()} USD
            </span>
          </div>

          <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl">
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold block mb-1">Fecha Inicio</span>
            <span className="text-sm font-semibold text-white">
              {proyecto.fecha_inicio ? new Date(proyecto.fecha_inicio).toLocaleDateString() : 'Pendiente'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DetalleProyecto;