import React, { useState } from 'react';

const NuevoProyecto = ({ isOpen, onClose, onProyectoCreado }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    presupuesto: '',
    estado: 'Planificacion'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validación básica en el frontend antes de enviar
    if (!formData.nombre || !formData.fecha_inicio) {
      setError('El nombre y la fecha de inicio son obligatorios.');
      setLoading(false);
      return;
    }

    try {
      // Obtenemos el token JWT guardado en el login
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/proyectos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Por si tu endpoint requiere token
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el proyecto');
      }

      // Éxito: avisamos al Dashboard para que recargue la lista, limpiamos y cerramos
      onProyectoCreado(data.proyecto);
      setFormData({
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        presupuesto: '',
        estado: 'Planificacion'
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1e1e24] border border-gray-800 rounded-lg max-w-lg w-full p-6 shadow-2xl text-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#8b5cf6]">Nueva Iniciativa PMO</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-40 border border-red-700 text-red-200 px-4 py-2 rounded mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Nombre del Proyecto *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full bg-[#121214] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-[#22c55e] transition-colors"
              placeholder="Ej. Migración de Infraestructura Core"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full bg-[#121214] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-[#22c55e] transition-colors h-20 resize-none"
              placeholder="Breve resumen del alcance..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Fecha Inicio *</label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                className="w-full bg-[#121214] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-[#22c55e] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Fecha Fin</label>
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                className="w-full bg-[#121214] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-[#22c55e] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Presupuesto (USD)</label>
              <input
                type="number"
                name="presupuesto"
                value={formData.presupuesto}
                onChange={handleChange}
                className="w-full bg-[#121214] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-[#22c55e] transition-colors"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
                <label className="block text-xs font-semibold uppercase text-[#A855F7] mb-1">Fase de la Iniciativa</label>
                <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full bg-[#121214] border border-[#2D2845] rounded p-2 text-white focus:outline-none focus:border-[#22c55e] transition-colors"
                >
                    <option value="Idea">💡 Idea / Propuesta</option>
                    <option value="Evaluacion">🔍 En Evaluación PMO</option>
                    <option value="Caso_de_Negocio">📊 Caso de Negocio (Soporte)</option>
                    <option value="Aprobado">✅ Aprobada (Priorizada)</option>
                    <option value="Rechazado">❌ No Viable</option>
                </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold rounded text-sm transition-colors"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoProyecto;