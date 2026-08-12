import React, { useState } from 'react';

const NuevoProyecto = ({ isOpen, onClose, onProyectoCreado }) => {
  const ESTADO_INICIAL = 'Caso_de_Negocio';

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    departamento: 'TI',
    lider_proyecto: 'Por Asignar',
    fecha_inicio: '',
    fecha_fin: '',
    presupuesto: '',
    estado: ESTADO_INICIAL
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

    if (!formData.nombre.trim() || !formData.fecha_inicio) {
      setError('El nombre y la fecha de inicio son obligatorios.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const codigoProyecto = formData.codigo.trim() || `MAP-${Date.now().toString().slice(-4)}`;

      const isoFechaInicio = new Date(`${formData.fecha_inicio}T00:00:00.000Z`).toISOString();
      const isoFechaFin = formData.fecha_fin 
        ? new Date(`${formData.fecha_fin}T00:00:00.000Z`).toISOString() 
        : isoFechaInicio;

      const payload = {
        codigo: codigoProyecto,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        departamento: formData.departamento.trim() || 'General',
        lider_proyecto: formData.lider_proyecto.trim() || 'Sin Asignar',
        estado: formData.estado,
        fecha_inicio: isoFechaInicio,
        fecha_fin: isoFechaFin,
        presupuesto: formData.presupuesto ? parseFloat(formData.presupuesto) : 0
      };

      const response = await fetch('http://localhost:5000/api/proyectos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Error al guardar el proyecto.');
      }

      onProyectoCreado(data.data || data);
      onClose();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1e1e24] border border-gray-800 rounded-lg max-w-lg w-full p-6 shadow-2xl text-gray-200">
        
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-3">
          <h2 className="text-xl font-bold text-[#8b5cf6]">📋 Nueva Iniciativa PMO</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl font-bold">&times;</button>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-200 px-4 py-2 rounded mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Código</label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                className="w-full bg-[#121214] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-[#22c55e] text-sm"
                placeholder="Autogenerado"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full bg-[#121214] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-[#22c55e] text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Departamento</label>
              <input
                type="text"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                className="w-full bg-[#121214] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-[#22c55e] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Líder de Proyecto</label>
              <input
                type="text"
                name="lider_proyecto"
                value={formData.lider_proyecto}
                onChange={handleChange}
                className="w-full bg-[#121214] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-[#22c55e] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full bg-[#121214] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-[#22c55e] h-20 resize-none text-sm"
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
                className="w-full bg-[#121214] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-[#22c55e] text-sm"
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
                className="w-full bg-[#121214] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-[#22c55e] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Presupuesto</label>
              <input
                type="number"
                name="presupuesto"
                value={formData.presupuesto}
                onChange={handleChange}
                className="w-full bg-[#121214] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-[#22c55e] text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-[#A855F7] mb-1">Fase / Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full bg-[#121214] border border-[#2D2845] rounded p-2 text-white focus:outline-none focus:border-[#22c55e] text-sm"
              >
                <option value="Caso_de_Negocio">📊 Caso de Negocio</option>
                <option value="Aprobado">✅ Aprobado</option>
                <option value="En_Proceso">🔄 En Proceso</option>
                <option value="En_Pausa">⏸️ En Pausa</option>
                <option value="Completado">🎉 Completado</option>
                <option value="Cancelado">🚫 Cancelado</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold rounded text-sm shadow-md disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Radicar Iniciativa'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default NuevoProyecto;