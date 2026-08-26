import React, { useState, useEffect } from 'react';

const SeccionKpis = ({ proyectoId }) => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [kpiSeleccionado, setKpiSeleccionado] = useState(null);
  const [nuevoValor, setNuevoValor] = useState('');

  // Cargar KPIs del proyecto
  const cargarKpis = async () => {
    try {
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

  if (loading) return <div className="text-gray-400 p-4">Cargando indicadores de rendimiento...</div>;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          📊 Indicadores Clave (KPIs)
        </h3>
        {/* Aquí puedes agregar un botón para "Crear Nuevo KPI" si el usuario es Admin/Gestor */}
      </div>

      {kpis.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay KPIs registrados para esta iniciativa.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kpis.map((kpi) => {
            // Calcular porcentaje de cumplimiento respecto a la meta
            const actual = Number(kpi.valor_actual || 0);
            const meta = Number(kpi.meta_valor || 1);
            const porcentajeProgreso = Math.min(Math.round((actual / meta) * 100), 100);

            return (
              <div key={kpi.id} className="bg-gray-800/60 border border-gray-700/60 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-white text-base">{kpi.nombre_kpi}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-green-900/40 text-green-400 border border-green-700/50">
                      {kpi.frecuencia}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{kpi.descripcion || 'Sin descripción'}</p>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Actual: <strong className="text-white">{actual} {kpi.unidad_medida}</strong></span>
                    <span className="text-gray-400">Meta: {meta} {kpi.unidad_medida}</span>
                  </div>
                  {/* Barra de progreso */}
                  <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-full transition-all duration-500" 
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
                    className="text-xs bg-green-600 hover:bg-green-500 text-gray-950 font-semibold px-3 py-1.5 rounded transition"
                  >
                    Registrar Avance
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal sencillo para actualizar medición */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
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
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-green-500 hover:bg-green-400 text-gray-950 font-semibold rounded transition"
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