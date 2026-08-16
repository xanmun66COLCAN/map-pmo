import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function ModalCrearIniciativa({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    area: 'Tecnología',
    prioridad: 'MEDIA',
    estado: 'Caso_de_Negocio', // Estado inicial por defecto
    presupuesto_estimado: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Si el modal está cerrado, no se renderiza nada en el DOM
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        departamento: formData.area, // Mapeamos 'area' del formulario al campo 'departamento' de Prisma
        prioridad: formData.prioridad,
        estado: formData.estado, // Enviamos el estado seleccionado
        solicitante_id: user?.id,
        presupuesto_estimado: formData.presupuesto_estimado
          ? Number(formData.presupuesto_estimado)
          : 0,
      };

      await api.post('/proyectos', payload);

      // Reiniciar el formulario
      setFormData({
        nombre: '',
        descripcion: '',
        area: 'Tecnología',
        prioridad: 'MEDIA',
        estado: 'Caso_de_Negocio',
        presupuesto_estimado: '',
      });

      // Notificar al padre para recargar la lista y cerrar
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al registrar iniciativa:', err);
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'Ocurrió un error al intentar registrar la iniciativa.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-[#2D2845] bg-[#13111C] p-6 text-white shadow-2xl">
        
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between border-b border-[#2D2845] pb-4 mb-4">
          <h2 className="text-xl font-bold text-white">
            Nueva Iniciativa <span className="text-[#A855F7]">MAP</span>
          </h2>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-[#1A1726] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#F87171] rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nombre / Título */}
          <div>
            <label className="block text-sm font-medium text-[#CBD5E1] mb-1">
              Nombre de la Iniciativa *
            </label>
            <input
              type="text"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Automatización de reportes semanales"
              className="w-full bg-[#1A1726] border border-[#2D2845] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#A855F7]"
            />
          </div>

          {/* Área, Prioridad y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#CBD5E1] mb-1">
                Área Solicitante
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full bg-[#1A1726] border border-[#2D2845] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#A855F7]"
              >
                <option value="Tecnología">Tecnología / TI</option>
                <option value="Operaciones">Operaciones</option>
                <option value="Finanzas">Finanzas</option>
                <option value="Gestión Humana">Gestión Humana</option>
                <option value="Comercial">Comercial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#CBD5E1] mb-1">
                Prioridad
              </label>
              <select
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                className="w-full bg-[#1A1726] border border-[#2D2845] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#A855F7]"
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#CBD5E1] mb-1">
                Estado Inicial
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full bg-[#1A1726] border border-[#2D2845] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#A855F7]"
              >
                <option value="Caso_de_Negocio">Caso de Negocio</option>
                <option value="Aprobado">Aprobado</option>
                <option value="En_Proceso">En Proceso</option>
                <option value="En_Pausa">En Pausa</option>
                <option value="Completado">Completado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Presupuesto Estimado */}
          <div>
            <label className="block text-sm font-medium text-[#CBD5E1] mb-1">
              Presupuesto Estimado
            </label>
            <input
              type="number"
              name="presupuesto_estimado"
              value={formData.presupuesto_estimado}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full bg-[#1A1726] border border-[#2D2845] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#A855F7]"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-[#CBD5E1] mb-1">
              Descripción y Justificación *
            </label>
            <textarea
              name="descripcion"
              required
              rows={3}
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describa brevemente los objetivos de la solicitud..."
              className="w-full bg-[#1A1726] border border-[#2D2845] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#A855F7]"
            />
          </div>

          {/* Acciones del Modal */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2D2845]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#2D2845] text-[#94A3B8] hover:text-white text-sm transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#A855F7] hover:bg-[#9333EA] text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {loading ? 'Guardando...' : 'Guardar Iniciativa'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}