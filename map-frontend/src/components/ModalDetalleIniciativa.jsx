// src/components/ModalDetalleIniciativa.jsx
import React, { useState, useEffect } from 'react';
import { Edit3, Save, X, Calendar, User, Tag, DollarSign, Briefcase } from 'lucide-react';

export default function ModalDetalleIniciativa({ iniciativa, onClose, onAprobar, onRechazar, onUpdate, esAdminOLider }) {
  // Estado local para manejar la edición y los datos del formulario
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Sincroniza los datos cada vez que se abre o cambia la iniciativa seleccionada
  useEffect(() => {
    if (iniciativa) {
      setFormData({ ...iniciativa });
      setIsEditing(false); // Resetea el modo edición al abrir una nueva iniciativa
    }
  }, [iniciativa]);

  if (!iniciativa) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(formData); // Envía los datos actualizados al componente padre
    }
    setIsEditing(false);
  };

  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'APROBADO':
        return 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30';
      case 'RECHAZADO':
        return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30';
      case 'EVALUACION':
      case 'EN_EVALUACION':
        return 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30';
      default:
        return 'bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-purple-500/40 bg-[#13111C] p-6 text-white shadow-[0_0_30px_rgba(168,85,247,0.2)]">
        
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b border-[#2D2845] pb-4 mb-5">
          <div>
            <div className="text-xs text-[#A855F7] font-semibold tracking-wider uppercase mb-1">
              {formData.codigo || `INIC-${formData.id}`}
            </div>
            {isEditing ? (
              <input 
                type="text" 
                name="nombre" 
                value={formData.nombre || formData.titulo || ''} 
                onChange={handleChange}
                className="w-full bg-[#1A1726] border border-purple-500/50 rounded-lg px-3 py-1 text-lg font-bold text-white focus:outline-none focus:border-[#22C55E]"
              />
            ) : (
              <h2 className="text-xl font-bold text-white">
                {formData.nombre || formData.titulo}
              </h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1.5 rounded-lg bg-[#1A1726] border border-[#2D2845] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenedor Principal de Campos en Grid */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 mb-6">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#1A1726] p-4 rounded-xl border border-[#2D2845]">
            
            {/* Estado */}
            <div>
              <span className="block text-[10px] uppercase font-semibold text-[#64748B] mb-1">Estado</span>
              {isEditing ? (
                <select 
                  name="estado" 
                  value={formData.estado || ''} 
                  onChange={handleChange}
                  className="w-full bg-[#13111C] border border-purple-500/40 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="EVALUACION">EVALUACION</option>
                  <option value="APROBADO">APROBADO</option>
                  <option value="RECHAZADO">RECHAZADO</option>
                  <option value="EN_EJECUCION">EN_EJECUCION</option>
                </select>
              ) : (
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeColor(formData.estado)}`}>
                  {formData.estado || 'EVALUACION'}
                </span>
              )}
            </div>

            {/* Solicitante */}
            <div>
              <span className="block text-[10px] uppercase font-semibold text-[#64748B] mb-1">Solicitante</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                <User className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="truncate">{formData.solicitante?.nombre || formData.nombre_solicitante || 'N/A'}</span>
              </div>
            </div>

            {/* Área */}
            <div>
              <span className="block text-[10px] uppercase font-semibold text-[#64748B] mb-1">Área / Departamento</span>
              {isEditing ? (
                <input 
                  type="text" 
                  name="area" 
                  value={formData.area || ''} 
                  onChange={handleChange}
                  className="w-full bg-[#13111C] border border-purple-500/40 rounded px-2 py-1 text-xs text-white"
                />
              ) : (
                <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  <span className="truncate">{formData.area || 'General'}</span>
                </div>
              )}
            </div>

            {/* Prioridad */}
            <div>
              <span className="block text-[10px] uppercase font-semibold text-[#64748B] mb-1">Prioridad</span>
              {isEditing ? (
                <select 
                  name="prioridad" 
                  value={formData.prioridad || ''} 
                  onChange={handleChange}
                  className="w-full bg-[#13111C] border border-purple-500/40 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="ALTA">ALTA</option>
                  <option value="MEDIA">MEDIA</option>
                  <option value="BAJA">BAJA</option>
                </select>
              ) : (
                <span className="text-sm font-medium text-white block mt-0.5">
                  {formData.prioridad || 'MEDIA'}
                </span>
              )}
            </div>

          </div>

          {/* Segunda Fila de Campos Detallados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Presupuesto */}
            <div className="bg-[#1A1726] p-4 rounded-xl border border-[#2D2845]">
              <span className="block text-[10px] uppercase font-semibold text-[#64748B] mb-1">Presupuesto Estimado</span>
              {isEditing ? (
                <input 
                  type="number" 
                  name="presupuesto_estimado" 
                  value={formData.presupuesto_estimado || ''} 
                  onChange={handleChange}
                  className="w-full bg-[#13111C] border border-purple-500/40 rounded px-2 py-1 text-sm text-white"
                />
              ) : (
                <div className="flex items-center gap-1.5 text-base font-bold text-[#22C55E]">
                  <DollarSign className="w-4 h-4" />
                  <span>
                    {formData.presupuesto_estimado
                      ? `$${Number(formData.presupuesto_estimado).toLocaleString('es-CO')}`
                      : 'Sin presupuesto asignado'}
                  </span>
                </div>
              )}
            </div>

            {/* Fecha de Creación / Registro */}
            <div className="bg-[#1A1726] p-4 rounded-xl border border-[#2D2845]">
              <span className="block text-[10px] uppercase font-semibold text-[#64748B] mb-1">Fecha de Registro</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>{formData.fecha_creacion || formData.created_at || 'N/A'}</span>
              </div>
            </div>

            {/* Categoría / Tipo */}
            <div className="bg-[#1A1726] p-4 rounded-xl border border-[#2D2845]">
              <span className="block text-[10px] uppercase font-semibold text-[#64748B] mb-1">Categoría / Tipo</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <Tag className="w-4 h-4 text-[#22C55E]" />
                <span>{formData.categoria || 'Proyecto Estratégico'}</span>
              </div>
            </div>

          </div>

          {/* Descripción y Justificación */}
          <div className="bg-[#1A1726] border border-[#2D2845] rounded-xl p-4">
            <span className="block text-[10px] uppercase font-semibold text-[#64748B] mb-2">Descripción y Justificación</span>
            {isEditing ? (
              <textarea 
                name="descripcion" 
                rows="4"
                value={formData.descripcion || ''} 
                onChange={handleChange}
                className="w-full bg-[#13111C] border border-purple-500/40 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#22C55E]"
              />
            ) : (
              <div className="text-sm text-[#CBD5E1] whitespace-pre-line max-h-36 overflow-y-auto leading-relaxed">
                {formData.descripcion || 'Sin descripción disponible.'}
              </div>
            )}
          </div>

        </div>

        {/* Acciones y Botones de Control */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2D2845]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#2D2845] text-[#94A3B8] hover:text-white text-sm bg-[#1A1726] transition-colors"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-3">
            {/* BOTÓN DE MODIFICACIÓN: Visible SOLO para roles con privilegios (esAdminOLider) */}
            {esAdminOLider && (
              <>
                {isEditing ? (
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#22C55E] text-white hover:bg-[#1eb355] rounded-lg text-sm font-semibold shadow-[0_0_12px_rgba(34,197,94,0.4)] transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    Modificar Datos
                  </button>
                )}
              </>
            )}

            {/* Botones de Aprobación / Rechazo originales de Admin o Líder */}
            {esAdminOLider && !isEditing && (
              <div className="flex items-center gap-2 pl-3 border-l border-[#2D2845]">
                <button
                  onClick={() => {
                    onRechazar(iniciativa.id);
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-lg text-sm transition-colors border border-[#EF4444]/30"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => {
                    onAprobar(iniciativa.id);
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E] hover:text-white rounded-lg text-sm transition-colors border border-[#22C55E]/30"
                >
                  Aprobar
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}