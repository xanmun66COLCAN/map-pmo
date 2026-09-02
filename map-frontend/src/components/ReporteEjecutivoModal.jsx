import React from 'react';
import { FileText, Printer, X, AlertTriangle } from 'lucide-react';

const ReporteEjecutivoModal = ({ proyecto, bitacora = [], onClose }) => {
  if (!proyecto) return null;

  const estaSobrePresupuesto = (proyecto.costo_real || 0) > (proyecto.presupuesto || 0);

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#13111C] border border-[#2D2845] rounded-2xl w-full max-w-4xl p-8 shadow-2xl relative text-gray-200 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        
        {/* Controles Ocultos al Imprimir */}
        <div className="flex justify-between items-center pb-6 border-b border-[#2D2845] print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Reporte Ejecutivo de Iniciativa</h2>
              <p className="text-xs text-gray-400">Vista consolidada lista para exportación y auditoría.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleImprimir}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-[#0B0A0F] border border-[#2D2845] text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido del Reporte (Optimizado para Impresión) */}
        <div className="mt-6 space-y-6 print:mt-0 print:space-y-4">
          
          {/* Encabezado del Reporte */}
          <div className="flex justify-between items-start border-b border-[#2D2845] pb-4 print:border-gray-300">
            <div>
              <span className="px-2.5 py-1 bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded text-xs font-bold font-mono">
                {proyecto.codigo}
              </span>
              <h1 className="text-xl font-bold text-white mt-2 print:text-black">{proyecto.nombre}</h1>
              <p className="text-xs text-gray-400 mt-1 print:text-gray-600">{proyecto.descripcion || 'Sin descripción detallada.'}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-full text-xs font-semibold">
                Estado: {proyecto.estado}
              </span>
              <p className="text-[10px] text-gray-400 mt-2 print:text-gray-500">Generado el: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Información General y Roles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#0B0A0F] p-4 rounded-xl border border-[#2D2845] print:bg-gray-50 print:border-gray-200">
            <div>
              <span className="block text-[10px] text-gray-400 uppercase">Project Manager</span>
              <span className="text-xs font-bold text-white print:text-black">{proyecto.project_manager || 'No asignado'}</span>
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 uppercase">Líder / Solicitante</span>
              <span className="text-xs font-medium text-gray-300 print:text-gray-800">{proyecto.lider_proyecto || 'General'}</span>
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 uppercase">Departamento</span>
              <span className="text-xs font-medium text-gray-300 print:text-gray-800">{proyecto.departamento || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 uppercase">Puntaje Multicriterio</span>
              <span className="text-xs font-bold text-purple-400 print:text-purple-700">{proyecto.puntaje_global || '0.00'} / 10</span>
            </div>
          </div>

          {/* Indicadores Financieros y Avance (Plan vs Real) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3 print:text-gray-700">Métricas de Ejecución & Presupuesto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0B0A0F] border border-[#2D2845] p-4 rounded-xl print:bg-gray-50 print:border-gray-200">
                <span className="text-[10px] text-gray-400">Presupuesto Planificado</span>
                <p className="text-lg font-mono font-bold text-white mt-1 print:text-black">${Number(proyecto.presupuesto || 0).toLocaleString()}</p>
              </div>
              <div className={`border p-4 rounded-xl ${estaSobrePresupuesto ? 'bg-rose-500/10 border-rose-500/30' : 'bg-[#0B0A0F] border-[#2D2845] print:bg-gray-50 print:border-gray-200'}`}>
                <span className={`text-[10px] ${estaSobrePresupuesto ? 'text-rose-400' : 'text-gray-400'}`}>Costo Real Ejecutado</span>
                <p className={`text-lg font-mono font-bold mt-1 ${estaSobrePresupuesto ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ${Number(proyecto.costo_real || 0).toLocaleString()}
                </p>
                {estaSobrePresupuesto && (
                  <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1 font-semibold">
                    <AlertTriangle className="w-3 h-3" /> Sobre presupuesto planificado
                  </span>
                )}
              </div>
              <div className="bg-[#0B0A0F] border border-[#2D2845] p-4 rounded-xl print:bg-gray-50 print:border-gray-200">
                <span className="text-[10px] text-gray-400">Porcentaje de Avance</span>
                <p className="text-lg font-mono font-bold text-purple-400 mt-1 print:text-purple-700">{proyecto.porcentaje_avance || 0}%</p>
              </div>
            </div>
          </div>

          {/* Bitácora Reciente */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3 print:text-gray-700">Últimos Seguimientos en Bitácora</h3>
            <div className="space-y-2">
              {bitacora.length > 0 ? (
                bitacora.slice(0, 3).map((seg, index) => (
                  <div key={index} className="bg-[#0B0A0F] border border-[#2D2845] p-3 rounded-xl text-xs print:bg-gray-50 print:border-gray-200">
                    <div className="flex justify-between text-gray-400 text-[10px] mb-1">
                      <span>Fecha: {new Date(seg.fecha_seguimiento).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-300 print:text-gray-800">{seg.detalle_seguimiento}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">No hay seguimientos registrados en la bitácora.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ReporteEjecutivoModal;