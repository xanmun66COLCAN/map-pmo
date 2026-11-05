import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Check, X, Plus } from 'lucide-react';
import api from '../api/axiosInstance.js'; // Ajusta la ruta de tu instancia de axios si es necesario

const SeccionKpis = ({ proyectoId, esAdminOLider, onEditKpi, onDeleteKpi }) => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [kpiSeleccionado, setKpiSeleccionado] = useState(null);
  const [nuevoValor, setNuevoValor] = useState('');

  // Estados para edición inline
  const [editandoId, setEditandoId] = useState(null);
  const [formEdicion, setFormEdicion] = useState({ nombre_kpi: '', meta_valor: '', valor_actual: '', unidad_medida: '', frecuencia: '' });

  // Cargar KPIs del proyecto
  const cargarKpis = async () => {
    try {
      // Si usas api de axios, puedes usar api.get, o mantener fetch si prefieres
      const response = await fetch(`http://localhost:5000/api/kpis/proyecto/${proyectoId}`);
      const result = await response.json();
      if (result.success) {
        setKpis(result.data);
      }
    } catch (error) {
      console.error('Error al cargar KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proyectoId) cargarKpis();
  }, [proyectoId]);

  // Manejar el registro de una nueva medición
  const handleRegistrarAvance = async (e) => {
    e.preventDefault();
    if (!kpiSeleccionado || !nuevoValor) return;

    try {
      const response = await fetch(`http://localhost:5000/api/kpis/${kpiSeleccionado.id}/medicion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor_nuevo: nuevoValor }),
      });

      const result = await response.json();
      if (result.success) {
        setModalAbierto(false);
        setNuevoValor('');
        setKpiSeleccionado(null);
        cargarKpis(); // Recargar datos
      } else {
        alert(result.message || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error al actualizar el KPI:', error);
    }
  };

  // Iniciar edición de un KPI
  const iniciarEdicion = (kpi) => {
    setEditandoId(kpi.id);
    setFormEdicion({
      nombre_kpi: kpi.nombre_kpi || '',
      meta_valor: kpi.meta_valor || '',
      valor_actual: kpi.valor_actual || '',
      unidad_medida: kpi.unidad_medida || '',
      frecuencia: kpi.frecuencia || ''
    });
  };

  // Guardar Edición de un KPI
  const guardarEdicion = async (kpiId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/kpis/${kpiId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEdicion),
      });
      const result = await response.json();
      if (result.success !== false) {
        setEditandoId(null);
        cargarKpis();
        if (onEditKpi) onEditKpi(kpiId, formEdicion);
      } else {
        alert(result.message || 'Error al actualizar el KPI');
      }
    } catch (error) {
      console.error('Error al editar KPI:', error);
    }
  };

  // Eliminar un KPI
  const eliminarKpi = async (kpiId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este KPI? Esta acción no se puede deshacer.')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/kpis/${kpiId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success !== false) {
        cargarKpis();
        if (onDeleteKpi) onDeleteKpi(kpiId);
      } else {
        alert(result.message || 'Error al eliminar el KPI');
      }
    } catch (error) {
      console.error('Error al eliminar KPI:', error);
    }
  };

  if (loading) return <div className="text-gray-400 p-4">Cargando indicadores de rendimiento...</div>;

  return (
    <div className="bg-[#13111C] border border-[#2D2845] rounded-xl p-6 shadow-lg mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          📊 Indicadores Clave (KPIs)
        </h3>
      </div>

      {kpis.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay KPIs registrados para esta iniciativa.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kpis.map((kpi) => {
            const actual = Number(kpi.valor_actual || 0);
            const meta = Number(kpi.meta_valor || 1);
            const porcentajeProgreso = Math.min(Math.round((actual / meta) * 100), 100);
            const esEditandoEste = editandoId === kpi.id;

            return (
              <div key={kpi.id} className="bg-[#0B0A0F] border border-[#2D2845] rounded-lg p-4 flex flex-col justify-between relative">
                {esEditandoEste ? (
                  // Formulario de Edición en Línea
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#A855F7] uppercase">Editar KPI</h4>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Nombre</label>
                      <input
                        type="text"
                        value={formEdicion.nombre_kpi}
                        onChange={(e) => setFormEdicion({ ...formEdicion, nombre_kpi: e.target.value })}
                        className="w-full bg-[#13111C] border border-[#A855F7] text-xs text-white p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Meta</label>
                        <input
                          type="number"
                          step="any"
                          value={formEdicion.meta_valor}
                          onChange={(e) => setFormEdicion({ ...formEdicion, meta_valor: e.target.value })}
                          className="w-full bg-[#13111C] border border-[#A855F7] text-xs text-white p-2 rounded focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Unidad</label>
                        <input
                          type="text"
                          value={formEdicion.unidad_medida}
                          onChange={(e) => setFormEdicion({ ...formEdicion, unidad_medida: e.target.value })}
                          className="w-full bg-[#13111C] border border-[#A855F7] text-xs text-white p-2 rounded focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => guardarEdicion(kpi.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={14} /> Guardar
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer"
                      >
                        <X size={14} /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Vista Normal del KPI
                  <>
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-white text-base">{kpi.nombre_kpi}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/30">
                            {kpi.frecuencia}
                          </span>
                          
                          {/* Botones de Editar y Borrar (Solo Administradores o Líderes) */}
                          {esAdminOLider && (
                            <div className="flex items-center gap-1 bg-[#13111C] p-1 rounded border border-[#2D2845]">
                              <button
                                onClick={() => iniciarEdicion(kpi)}
                                className="text-purple-300 hover:text-white p-1 rounded transition cursor-pointer"
                                title="Editar KPI"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => eliminarKpi(kpi.id)}
                                className="text-red-400 hover:text-red-300 p-1 rounded transition cursor-pointer"
                                title="Eliminar KPI"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">{kpi.descripcion || 'Sin descripción'}</p>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Actual: <strong className="text-white">{actual} {kpi.unidad_medida}</strong></span>
                        <span className="text-gray-400">Meta: {meta} {kpi.unidad_medida}</span>
                      </div>
                      {/* Barra de progreso */}
                      <div className="w-full bg-[#13111C] border border-[#2D2845] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#A855F7] h-full transition-all duration-500" 
                          style={{ width: `${porcentajeProgreso}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          setKpiSeleccionado(kpi);
                          setNuevoValor(kpi.valor_actual);
                          setModalAbierto(true);
                        }}
                        className="text-xs bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold px-3 py-1.5 rounded transition cursor-pointer shadow-md"
                      >
                        Registrar Avance
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para actualizar medición */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0A0F] border border-[#2D2845] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h4 className="text-lg font-bold text-white mb-2">Actualizar Avance: {kpiSeleccionado?.nombre_kpi}</h4>
            <p className="text-xs text-gray-400 mb-4">Ingresa el nuevo valor medido para actualizar el indicador y el historial.</p>
            
            <form onSubmit={handleRegistrarAvance}>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-300 mb-1">Nuevo Valor ({kpiSeleccionado?.unidad_medida})</label>
                <input
                  type="number"
                  step="any"
                  value={nuevoValor}
                  onChange={(e) => setNuevoValor(e.target.value)}
                  className="w-full bg-[#13111C] border border-[#2D2845] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#A855F7]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-xs bg-[#2D2845] hover:bg-[#3D375B] text-gray-300 rounded transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold rounded transition cursor-pointer shadow-md"
                >
                  Guardar Medición
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeccionKpis;