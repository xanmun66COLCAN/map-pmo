import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DetalleProyecto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const cargarProyecto = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/proyectos/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.message || 'Error al obtener la iniciativa');
        }

        if (active) {
          setProyecto(data);
        }
      } catch (err) {
        if (active) {
          console.error("❌ Error al cargar detalle:", err.message);
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    cargarProyecto();

    return () => {
      active = false;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A0F] text-white flex justify-center items-center">
        <p className="animate-pulse text-[#94A3B8]">Cargando detalle del proyecto...</p>
      </div>
    );
  }

  if (error || !proyecto) {
    return (
      <div className="min-h-screen bg-[#0B0A0F] text-white p-6 flex flex-col items-center justify-center">
        <div className="bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171] p-6 rounded-xl text-center max-w-md">
          <p className="mb-4">⚠️ {error || 'No se pudo cargar la iniciativa.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#A855F7] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#9333EA] transition-all"
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
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs text-[#94A3B8] hover:text-white mb-6 flex items-center gap-2"
        >
          ← Volver al Dashboard
        </button>

        <div className="bg-[#13111C] border border-[#2D2845] rounded-xl p-6 shadow-xl">
          <h1 className="text-2xl font-bold text-white mb-2">{proyecto.nombre}</h1>
          <p className="text-sm text-[#94A3B8] mb-4">{proyecto.descripcion || 'Sin descripción.'}</p>
          
          <div className="flex gap-4 text-xs pt-4 border-t border-[#2D2845]">
            <span className="text-[#94A3B8]">Código: <strong className="text-white">{proyecto.codigo || 'N/A'}</strong></span>
            <span className="text-[#22C55E]">Estado: <strong>{proyecto.estado || 'Idea'}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleProyecto;