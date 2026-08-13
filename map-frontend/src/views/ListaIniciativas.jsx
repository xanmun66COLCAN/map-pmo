import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import ModalCrearIniciativa from '../components/ModalCrearIniciativa';
import ModalDetalleIniciativa from '../components/ModalDetalleIniciativa';

export default function ListaIniciativas() {
  const { user, tieneRol } = useAuth();
  const [iniciativas, setIniciativas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [iniciativaSeleccionada, setIniciativaSeleccionada] = useState(null);
  const [procesandoId, setProcesandoId] = useState(null);

  useEffect(() => {
    cargarIniciativas();
  }, []);

  const cargarIniciativas = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/proyectos');
      setIniciativas(response.data);
    } catch (err) {
      console.error('Error al cargar proyectos:', err);
      setError('No se pudieron obtener las iniciativas del servidor.');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoIniciativa = async (id, nuevoEstado) => {
    try {
      setProcesandoId(id);
      await api.patch(`/proyectos/${id}`, { estado: nuevoEstado });
      await cargarIniciativas();
    } catch (err) {
      console.error(`Error al cambiar estado a ${nuevoEstado}:`, err);
      alert(err.response?.data?.mensaje || 'No se pudo actualizar el estado de la iniciativa.');
    } finally {
      setProcesandoId(null);
    }
  };

  const iniciativasVisibles = iniciativas.filter((item) => {
    if (!tieneRol(['ADMINISTRADOR', 'LIDER_PMO']) && item.solicitante_id !== user?.id) {
      return false;
    }
    return true;
  });

  const iniciativasFiltradas = iniciativasVisibles.filter((item) => {
    if (filtroEstado !== 'TODOS' && item.estado !== filtroEstado) {
      return false;
    }
    return true;
  });

  // Función para exportar a CSV
  const exportarAExcelCSV = () => {
    if (iniciativasFiltradas.length === 0) {
      alert('No hay iniciativas para exportar con los filtros actuales.');
      return;
    }

    const encabeza = ['Código', 'Nombre / Proyecto', 'Solicitante', 'Área', 'Estado', 'Presupuesto Estimado', 'Prioridad'];
    
    const filas = iniciativasFiltradas.map((item) => [
      `"${item.codigo || `INIC-${item.id}`}"`,
      `"${(item.nombre || item.titulo || '').replace(/"/g, '""')}"`,
      `"${(item.solicitante?.nombre || item.nombre_solicitante || 'N/A').replace(/"/g, '""')}"`,
      `"${(item.area || 'General').replace(/"/g, '""')}"`,
      `"${item.estado || 'EVALUACION'}"`,
      `"${item.presupuesto_estimado || 0}"`,
      `"${item.prioridad || 'MEDIA'}"`
    ]);

    const contenidoCSV = [
      encabeza.join(','),
      ...filas.map((f) => f.join(','))
    ].join('\n');

    // Blob con UTF-8 BOM para soporte correcto de caracteres especiales en Excel
    const blob = new Blob(['\uFEFF' + contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const fecha = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `iniciativas_MAP_${fecha}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kpis = {
    total: iniciativasVisibles.length,
    evaluacion: iniciativasVisibles.filter((i) => i.estado === 'EVALUACION' || i.estado === 'EN_EVALUACION').length,
    aprobadas: iniciativasVisibles.filter((i) => i.estado === 'APROBADO').length,
    rechazadas: iniciativasVisibles.filter((i) => i.estado === 'RECHAZADO').length,
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
    <div className="p-6 bg-[#0B0A0F] min-h-screen text-white">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Portafolio de Iniciativas <span className="text-[#A855F7]">MAP PMO</span>
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            {tieneRol(['ADMINISTRADOR', 'LIDER_PMO'])
              ? 'Gestión, priorización y control de solicitudes PMO'
              : 'Seguimiento a tus solicitudes presentadas'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#A855F7] hover:bg-[#9333EA] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-[#A855F7]/20"
          >
            <span>+</span> Nueva Iniciativa
          </button>

          {/* Botón Exportar CSV */}
          <button
            onClick={exportarAExcelCSV}
            className="px-3 py-2 bg-[#13111C] border border-[#2D2845] hover:border-[#22C55E] text-[#94A3B8] hover:text-[#22C55E] text-sm rounded-lg transition-all flex items-center gap-2"
            title="Exportar iniciativas visibles a CSV/Excel"
          >
            📥 Exportar
          </button>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-[#13111C] border border-[#2D2845] text-[#94A3B8] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#A855F7]"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="BORRADOR">Borrador</option>
            <option value="EVALUACION">En Evaluación</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>

          <button
            onClick={cargarIniciativas}
            className="p-2 bg-[#13111C] border border-[#2D2845] rounded-lg hover:border-[#A855F7] transition-all text-[#94A3B8] hover:text-white"
            title="Actualizar datos"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Tarjetas KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#13111C] border border-[#2D2845] rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider block">Total Iniciativas</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{kpis.total}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#A855F7]/10 border border-[#A855F7]/30 flex items-center justify-center text-[#A855F7] text-lg">📂</div>
        </div>

        <div className="bg-[#13111C] border border-[#2D2845] rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider block">En Evaluación</span>
            <span className="text-2xl font-extrabold text-[#3B82F6] mt-1 block">{kpis.evaluacion}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] text-lg">⏳</div>
        </div>

        <div className="bg-[#13111C] border border-[#2D2845] rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider block">Aprobadas</span>
            <span className="text-2xl font-extrabold text-[#22C55E] mt-1 block">{kpis.aprobadas}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] text-lg">✅</div>
        </div>

        <div className="bg-[#13111C] border border-[#2D2845] rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider block">Rechazadas</span>
            <span className="text-2xl font-extrabold text-[#EF4444] mt-1 block">{kpis.rechazadas}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] text-lg">🚫</div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#F87171] rounded-lg text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={cargarIniciativas} className="underline font-semibold">Reintentar</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20 text-[#94A3B8]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A855F7] mr-3"></div>
          Obteniendo iniciativas de MAP...
        </div>
      ) : (
        <div className="bg-[#13111C] border border-[#2D2845] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#94A3B8]">
              <thead className="bg-[#1A1726] text-[#94A3B8] uppercase text-xs font-semibold tracking-wider border-b border-[#2D2845]">
                <tr>
                  <th className="py-4 px-6">Código / Proyecto</th>
                  <th className="py-4 px-6">Solicitante</th>
                  <th className="py-4 px-6">Área / Impacto</th>
                  <th className="py-4 px-6">Estado</th>
                  {tieneRol(['ADMINISTRADOR', 'LIDER_PMO']) && (
                    <th className="py-4 px-6 text-right">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D2845]">
                {iniciativasFiltradas.length > 0 ? (
                  iniciativasFiltradas.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setIniciativaSeleccionada(item)}
                      className="hover:bg-[#1A1726]/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6 font-medium text-white">
                        <div className="font-semibold text-white">{item.nombre || item.titulo}</div>
                        <div className="text-xs text-[#64748B]">{item.codigo || `INIC-${item.id}`}</div>
                      </td>
                      <td className="py-4 px-6 text-[#CBD5E1]">
                        {item.solicitante?.nombre || item.nombre_solicitante || 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        {item.area || 'General'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(item.estado)}`}>
                          {item.estado || 'EVALUACION'}
                        </span>
                      </td>

                      {tieneRol(['ADMINISTRADOR', 'LIDER_PMO']) && (
                        <td className="py-4 px-6 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            disabled={procesandoId === item.id}
                            onClick={() => cambiarEstadoIniciativa(item.id, 'APROBADO')}
                            className="px-3 py-1 bg-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E] hover:text-white rounded text-xs transition-colors disabled:opacity-50"
                          >
                            Aprobar
                          </button>
                          <button
                            disabled={procesandoId === item.id}
                            onClick={() => cambiarEstadoIniciativa(item.id, 'RECHAZADO')}
                            className="px-3 py-1 bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded text-xs transition-colors disabled:opacity-50"
                          >
                            Rechazar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={tieneRol(['ADMINISTRADOR', 'LIDER_PMO']) ? 5 : 4}
                      className="text-center py-12 text-[#64748B]"
                    >
                      No se encontraron iniciativas registradas con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ModalCrearIniciativa
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={cargarIniciativas}
      />

      <ModalDetalleIniciativa
        iniciativa={iniciativaSeleccionada}
        onClose={() => setIniciativaSeleccionada(null)}
        onAprobar={(id) => cambiarEstadoIniciativa(id, 'APROBADO')}
        onRechazar={(id) => cambiarEstadoIniciativa(id, 'RECHAZADO')}
        esAdminOLider={tieneRol(['ADMINISTRADOR', 'LIDER_PMO'])}
      />
    </div>
  );
}