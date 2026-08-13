export default function ModalDetalleIniciativa({ iniciativa, onClose, onAprobar, onRechazar, esAdminOLider }) {
  if (!iniciativa) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-[#2D2845] bg-[#13111C] p-6 text-white shadow-2xl">
        
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b border-[#2D2845] pb-4 mb-4">
          <div>
            <div className="text-xs text-[#A855F7] font-semibold tracking-wider uppercase mb-1">
              {iniciativa.codigo || `INIC-${iniciativa.id}`}
            </div>
            <h2 className="text-xl font-bold text-white">
              {iniciativa.nombre || iniciativa.titulo}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-[#1A1726] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Detalles en Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-[#1A1726] p-4 rounded-lg border border-[#2D2845]">
          <div>
            <span className="block text-xs text-[#64748B]">Estado</span>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeColor(iniciativa.estado)}`}>
              {iniciativa.estado || 'EVALUACION'}
            </span>
          </div>

          <div>
            <span className="block text-xs text-[#64748B]">Solicitante</span>
            <span className="text-sm font-medium text-white mt-1 block">
              {iniciativa.solicitante?.nombre || iniciativa.nombre_solicitante || 'N/A'}
            </span>
          </div>

          <div>
            <span className="block text-xs text-[#64748B]">Área</span>
            <span className="text-sm font-medium text-white mt-1 block">
              {iniciativa.area || 'General'}
            </span>
          </div>

          <div>
            <span className="block text-xs text-[#64748B]">Prioridad</span>
            <span className="text-sm font-medium text-white mt-1 block">
              {iniciativa.prioridad || 'MEDIA'}
            </span>
          </div>
        </div>

        {/* Presupuesto */}
        <div className="mb-6">
          <span className="block text-xs text-[#64748B] mb-1">Presupuesto Estimado</span>
          <div className="text-lg font-bold text-[#22C55E]">
            {iniciativa.presupuesto_estimado
              ? `$${Number(iniciativa.presupuesto_estimado).toLocaleString('es-CO')}`
              : 'Sin presupuesto asignado'}
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-6">
          <span className="block text-xs text-[#64748B] mb-2">Descripción y Justificación</span>
          <div className="bg-[#1A1726] border border-[#2D2845] rounded-lg p-4 text-sm text-[#CBD5E1] whitespace-pre-line max-h-48 overflow-y-auto">
            {iniciativa.descripcion || 'Sin descripción disponible.'}
          </div>
        </div>

        {/* Acciones del Modal */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2D2845]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#2D2845] text-[#94A3B8] hover:text-white text-sm transition-colors"
          >
            Cerrar
          </button>

          {esAdminOLider && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onRechazar(iniciativa.id);
                  onClose();
                }}
                className="px-4 py-2 bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-lg text-sm transition-colors"
              >
                Rechazar
              </button>
              <button
                onClick={() => {
                  onAprobar(iniciativa.id);
                  onClose();
                }}
                className="px-4 py-2 bg-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E] hover:text-white rounded-lg text-sm transition-colors"
              >
                Aprobar
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}