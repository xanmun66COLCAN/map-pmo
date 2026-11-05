import React, { useState } from 'react';
import api from '../api/axiosInstance.js'; // 👈 Importa tu instancia centralizada de Axios

const EvaluacionMulticriterio = ({ proyecto, onActualizado }) => {
  const [criterios, setCriterios] = useState({
    beneficio: proyecto?.beneficio ?? 5,
    costo: proyecto?.costo ?? 5,
    riesgo: proyecto?.riesgo ?? 5,
    alineacion: proyecto?.alineacion ?? 5,
  });

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const calcularPuntajePreview = () => {
    const score = 
      (Number(criterios.beneficio) * 0.30) + 
      (Number(criterios.costo) * 0.25) + 
      (Number(criterios.riesgo) * 0.20) + 
      (Number(criterios.alineacion) * 0.25);
    return score.toFixed(2);
  };

  const handleChange = (e) => {
    setCriterios({
      ...criterios,
      [e.target.name]: Number(e.target.value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    try {
      // 🚀 Usamos la instancia centralizada 'api' apuntando al puerto 5000 con JWT integrado
      const response = await api.put(`/proyectos/${proyecto.id}/evaluacion`, criterios);

      const data = response.data;

      if (data.success) {
        setMensaje({ tipo: 'success', texto: '¡Evaluación guardada en PostgreSQL con éxito!' });
        if (onActualizado) {
          onActualizado(data.data);
        }
      } else {
        setMensaje({ tipo: 'error', texto: data.message || 'Error al actualizar' });
      }
    } catch (error) {
      console.error('❌ Error al guardar evaluación:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error de conexión con el servidor.';
      setMensaje({ tipo: 'error', texto: errorMsg });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-[#13111C] border border-[#2D2845] rounded-xl p-6 text-white shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#A855F7]">⚖️ Calificación Multicriterio</h3>
          <p className="text-xs text-[#94A3B8]">Ponderación estratégica para priorización de iniciativas</p>
        </div>
        <div className="bg-[#0B0A0F] border border-[#2D2845] px-4 py-2 rounded-lg text-center">
          <span className="block text-xs text-[#94A3B8]">Puntaje Global</span>
          <span className="text-xl font-black text-emerald-400">{calcularPuntajePreview()} <span className="text-xs text-gray-500">/ 10</span></span>
        </div>
      </div>

      {mensaje && (
        <div className={`p-3 mb-4 rounded-lg text-sm ${mensaje.tipo === 'success' ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800' : 'bg-red-950/50 text-red-300 border border-red-800'}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Beneficio */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-300">📈 Beneficio / Retorno Esperado (30%)</span>
            <span className="text-[#A855F7] font-bold">{criterios.beneficio} / 10</span>
          </div>
          <input 
            type="range" min="1" max="10" step="1"
            name="beneficio"
            value={criterios.beneficio}
            onChange={handleChange}
            className="w-full accent-[#A855F7] cursor-pointer"
          />
        </div>

        {/* Costo */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-300">💰 Costo de Implementación (25%) <span className="text-xs text-gray-500">(Inverso)</span></span>
            <span className="text-[#A855F7] font-bold">{criterios.costo} / 10</span>
          </div>
          <input 
            type="range" min="1" max="10" step="1"
            name="costo"
            value={criterios.costo}
            onChange={handleChange}
            className="w-full accent-[#A855F7] cursor-pointer"
          />
        </div>

        {/* Riesgo */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-300">⚠️ Nivel de Riesgo (20%) <span className="text-xs text-gray-500">(Inverso)</span></span>
            <span className="text-[#A855F7] font-bold">{criterios.riesgo} / 10</span>
          </div>
          <input 
            type="range" min="1" max="10" step="1"
            name="riesgo"
            value={criterios.riesgo}
            onChange={handleChange}
            className="w-full accent-[#A855F7] cursor-pointer"
          />
        </div>

        {/* Alineación */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-300">🎯 Alineación Estratégica (25%)</span>
            <span className="text-[#A855F7] font-bold">{criterios.alineacion} / 10</span>
          </div>
          <input 
            type="range" min="1" max="10" step="1"
            name="alineacion"
            value={criterios.alineacion}
            onChange={handleChange}
            className="w-full accent-[#A855F7] cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="w-full mt-4 bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-lg shadow-[#A855F7]/30 disabled:opacity-50"
        >
          {guardando ? 'Guardando en PostgreSQL...' : 'Guardar y Calcular Puntaje'}
        </button>
      </form>
    </div>
  );
};

export default EvaluacionMulticriterio;