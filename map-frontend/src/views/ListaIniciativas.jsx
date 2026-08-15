import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import ModalCrearIniciativa from '../components/ModalCrearIniciativa';
import ModalDetalleIniciativa from '../components/ModalDetalleIniciativa';

export default function ListaIniciativas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filtroUrl = searchParams.get('filtro');

  const [iniciativas, setIniciativas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtro por Estado
  const [filtroEstado, setFiltroEstado] = useState(
    filtroUrl === 'en_estudio' ? 'EN_ESTUDIO' : 'TODOS'
  );

  // Ordenamiento interactivo por columna
  const [orden, setOrden] = useState({ columna: 'fecha', direccion: 'desc' });

  // Sincronizar el filtro cuando cambie la URL
  useEffect(() => {
    if (filtroUrl === 'en_estudio') {
      setFiltroEstado('EN_ESTUDIO');
    }
  }, [filtroUrl]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [iniciativaSeleccionada, setIniciativaSeleccionada] = useState(null);
  const [procesandoId, setProcesandoId] = useState(null);

  const usuarioString = localStorage.getItem('usuario');
  const user = usuarioString ? JSON.parse(usuarioString) : null;

  const tieneRol = (rolesPermitidos) => {
    if (!user) return false;
    const rolUsuario = (user.rol || user.role || '').toLowerCase(); // Normalizamos a minúsculas
    return rolesPermitidos.some((r) => r.toLowerCase() === rolUsuario);
  };

  useEffect(() => {
    cargarIniciativas();
  }, []);

  const cargarIniciativas = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/proyectos');

      const responseData = response.data;
      
      let listaProyectos = [];
      if (Array.isArray(responseData)) {
        listaProyectos = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        listaProyectos = responseData.data;
      } else if (responseData && Array.isArray(responseData.proyectos)) {
        listaProyectos = responseData.proyectos;
      }

      setIniciativas(listaProyectos);
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
      await api.patch(`/proyectos/${id}/estado`, { nuevoEstado });
      await cargarIniciativas();
    } catch (err) {
      console.error(`Error al cambiar estado a ${nuevoEstado}:`, err);
      alert(err.response?.data?.message || err.response?.data?.error || 'No se pudo actualizar el estado de la iniciativa.');
    } finally {
      setProcesandoId(null);
    }
  };

  const normalizar = (str) => (str || '').toString().toLowerCase().replace(/[\s_]+/g, '').trim();

  // Cambiar columna de ordenamiento o alternar dirección
  const manejarOrden = (columnaKey) => {
    setOrden((prev) => ({
      columna: columnaKey,
      direccion: prev.columna === columnaKey && prev.direccion === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Renderizador de iconos de dirección
  const renderIconoOrden = (columnaKey) => {
    if (orden.columna !== columnaKey) {
      return <span className="text-[#64748B] ml-1 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>;
    }
    return <span className="text-[#A855F7] ml-1">{orden.direccion === 'asc' ? '↑' : '↓'}</span>;
  };

  const iniciativasVisibles = iniciativas.filter((item) => {
    if (!tieneRol(['admin', 'administrador', 'lider_pmo', 'pmo_manager', 'director']) && item.solicitante_id && user?.id && item.solicitante_id !== user.id) {
      return true;
    }
    return true;
  });

  // Filtrado
  const iniciativasFiltradas = iniciativasVisibles.filter((item) => {
    const estadoProyecto = normalizar(item.estado);

    if (filtroEstado === 'EN_ESTUDIO') {
      const estadosEstudio = ['enproceso', 'enpausa', 'casodenegocio', 'evaluacion', 'enevaluacion'];
      return estadosEstudio.includes(estadoProyecto);
    }

    if (filtroEstado !== 'TODOS') {
      const estadoFiltro = normalizar(filtroEstado);
      if (estadoProyecto !== estadoFiltro) return false;
    }

    return true;
  });

  // Ordenamiento por columna activa
  const iniciativasOrdenadas = [...iniciativasFiltradas].sort((a, b) => {
    const factor = orden.direccion === 'asc' ? 1 : -1;

    switch (orden.columna) {
      case 'nombre':
        return (a.nombre || a.titulo || '').localeCompare(b.nombre || b.titulo || '') * factor;

      case 'solicitante': {
        const solA = a.solicitante?.nombre || a.nombre_solicitante || '';
        const solB = b.solicitante?.nombre || b.nombre_solicitante || '';
        return solA.localeCompare(solB) * factor;
      }

      case 'area': {
        const areaA = a.departamento || a.area || '';
        const areaB = b.departamento || b.area || '';
        return areaA.localeCompare(areaB) * factor;
      }

      case 'estado':
        return (a.estado || '').localeCompare(b.estado || '') * factor;

      case 'fecha':
      default: {
        const fechaA = new Date(a.fecha_creacion || a.createdAt || 0);
        const fechaB = new Date(b.fecha_creacion || b.createdAt || 0);
        return (fechaA - fechaB) * factor;
      }
    }
  });

  const exportarAExcelCSV = () => {
    if (iniciativasOrdenadas.length === 0) {
      alert('No hay iniciativas para exportar con los filtros actuales.');
      return;
    }

    const encabezados = ['Código', 'Nombre / Proyecto', 'Solicitante', 'Área / Depto', 'Estado', 'Presupuesto Estimado', 'Prioridad'];
    
    const filas = iniciativasOrdenadas.map((item) => [
      `"${item.codigo || `INIC-${item.id}`}"`,
      `"${(item.nombre || item.titulo || '').replace(/"/g, '""')}"`,
      `"${(item.solicitante?.nombre || item.nombre_solicitante || 'N/A').replace(/"/g, '""')}"`,
      `"${(item.departamento || item.area || 'General').replace(/"/g, '""')}"`,
      `"${item.estado || 'Idea'}"`,
      `"${item.presupuesto_estimado || item.presupuesto || 0}"`,
      `"${item.prioridad || 'MEDIA'}"`
    ]);

    const contenidoCSV = [
      encabezados.join(','),
      ...filas.map((f) => f.join(','))
    ].join('\n');

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
    enEvaluacion: iniciativasVisibles.filter((i) => ['casodenegocio', 'evaluacion', 'enevaluacion', 'enproceso', 'idea'].includes(normalizar(i.estado))).length,
    aprobadas: iniciativasVisibles.filter((i) => ['aprobado', 'completado'].includes(normalizar(i.estado))).length,
    enPausaRechazadas: iniciativasVisibles.filter((i) => ['rechazado', 'enpausa'].includes(normalizar(i.estado))).length,
  };

  const getBadgeColor = (estado) => {
    const est = normalizar(estado);
    if (['aprobado', 'completado'].includes(est)) return 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30';
    if (['rechazado', 'enpausa'].includes(est)) return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30';
    if (['enproceso'].includes(est)) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (['casodenegocio'].includes(est)) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/30';
  };

  const formatoNombreEstado = (estado) => {
    if (!estado) return 'Idea';
    return estado.replace(/_/g, ' ');
  };

  const esAdminOPmo = tieneRol(['admin', 'pmo_manager', 'director', 'administrador', 'lider_pmo']);

  return (
    <div className="p-6 bg-[#0B0A0F] min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs bg-[#13111C] border border-[#2D2845] hover:border-[#A855F7] text-[#94A3B8] hover:text-white px-3 py-1.5 rounded-lg transition-all"
              >
                ← Volver al Dashboard
              </button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 mt-3">
              Portafolio de Iniciativas <span className="text-[#A855F7]">MAP PMO</span>
            </h1>
            <p className="text-[#94A3B8] text-sm mt-1">
              Gestión, priorización y control de solicitudes PMO
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#A855F7] to-[#7C3AED] hover:from-[#9333EA] hover:to-[#6D28D9] text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
            >
              <span>+</span> Nueva Iniciativa
            </button>

            <button
              onClick={exportarAExcelCSV}
              className="px-3 py-2 bg-[#13111C] border border-[#2D2845] hover:border-[#22C55E] text-[#94A3B8] hover:text-[#22C55E] text-sm rounded-lg transition-all flex items-center gap-2"
              title="Exportar iniciativas visibles a CSV/Excel"
            >
              📥 Exportar CSV
            </button>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="bg-[#13111C] border border-[#2D2845] text-[#94A3B8] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#A855F7]"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="EN_ESTUDIO">En Estudio (En Proceso / Pausa)</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Completado">Completado</option>
              <option value="En_Proceso">En Proceso</option>
              <option value="Caso_de_Negocio">Caso de Negocio</option>
              <option value="En_Pausa">En Pausa</option>
              <option value="Rechazado">Rechazado</option>
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
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider block">En Evaluación / Proceso</span>
              <span className="text-2xl font-extrabold text-[#3B82F6] mt-1 block">{kpis.enEvaluacion}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] text-lg">⏳</div>
          </div>

          <div className="bg-[#13111C] border border-[#2D2845] rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider block">Aprobadas / Completadas</span>
              <span className="text-2xl font-extrabold text-[#22C55E] mt-1 block">{kpis.aprobadas}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] text-lg">✅</div>
          </div>

          <div className="bg-[#13111C] border border-[#2D2845] rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider block">Rechazadas / En Pausa</span>
              <span className="text-2xl font-extrabold text-[#EF4444] mt-1 block">{kpis.enPausaRechazadas}</span>
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
                    <th 
                      onClick={() => manejarOrden('nombre')}
                      className="py-4 px-6 cursor-pointer hover:text-white transition-colors group select-none"
                    >
                      <div className="flex items-center">
                        Código / Proyecto {renderIconoOrden('nombre')}
                      </div>
                    </th>

                    <th 
                      onClick={() => manejarOrden('solicitante')}
                      className="py-4 px-6 cursor-pointer hover:text-white transition-colors group select-none"
                    >
                      <div className="flex items-center">
                        Solicitante {renderIconoOrden('solicitante')}
                      </div>
                    </th>

                    <th 
                      onClick={() => manejarOrden('area')}
                      className="py-4 px-6 cursor-pointer hover:text-white transition-colors group select-none"
                    >
                      <div className="flex items-center">
                        Área / Depto {renderIconoOrden('area')}
                      </div>
                    </th>

                    <th 
                      onClick={() => manejarOrden('estado')}
                      className="py-4 px-6 cursor-pointer hover:text-white transition-colors group select-none"
                    >
                      <div className="flex items-center">
                        Estado {renderIconoOrden('estado')}
                      </div>
                    </th>

                    <th className="py-4 px-6 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D2845]">
                  {iniciativasOrdenadas.length > 0 ? (
                    iniciativasOrdenadas.map((item) => {
                      const itemId = item.id || item.id_iniciativa;
                      return (
                        <tr
                          key={itemId}
                          onClick={() => navigate(`/proyectos/${itemId}`)}
                          className="hover:bg-[#1A1726]/50 transition-colors cursor-pointer"
                        >
                          <td className="py-4 px-6 font-medium text-white">
                            <div className="font-semibold text-white">{item.nombre || item.titulo}</div>
                            <div className="text-xs text-[#64748B]">{item.codigo || `INIC-${itemId}`}</div>
                          </td>
                          <td className="py-4 px-6 text-[#CBD5E1]">
                            {item.solicitante?.nombre || item.nombre_solicitante || 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-[#CBD5E1]">
                            {item.solicitante?.departamento || item.departamento || item.area || 'General'}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(item.estado)}`}>
                              {formatoNombreEstado(item.estado)}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                            {esAdminOPmo ? (
                              <select
                                disabled={procesandoId === itemId}
                                value={item.estado || 'Caso_de_Negocio'}
                                onChange={(e) => cambiarEstadoIniciativa(itemId, e.target.value)}
                                className="bg-[#1A1726] text-white border border-[#2D2845] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#A855F7] cursor-pointer"
                              >
                                <option value="Caso_de_Negocio">Caso de Negocio</option>
                                <option value="En_Revision">En Revisión</option>
                                <option value="En_Proceso">En Proceso</option>
                                <option value="Aprobado">Aprobado</option>
                                <option value="Completado">Completado</option>
                                <option value="En_Pausa">En Pausa</option>
                                <option value="Rechazado">Rechazado</option>
                              </select>
                            ) : (
                              <span className="text-xs text-[#64748B]">Solo lectura</span>
                            )}
                            {procesandoId === itemId && (
                              <span className="ml-2 text-xs text-[#A855F7]">Guardando...</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
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

        {isModalOpen && (
          <ModalCrearIniciativa
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={cargarIniciativas}
          />
        )}

        {iniciativaSeleccionada && (
          <ModalDetalleIniciativa
            iniciativa={iniciativaSeleccionada}
            onClose={() => setIniciativaSeleccionada(null)}
            onAprobar={(id) => cambiarEstadoIniciativa(id, 'Aprobado')}
            onRechazar={(id) => cambiarEstadoIniciativa(id, 'Rechazado')}
            esAdminOLider={esAdminOPmo}
          />
        )}
      </div>
    </div>
  );
}