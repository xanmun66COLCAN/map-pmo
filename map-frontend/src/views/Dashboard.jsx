// src/views/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import NuevoProyecto from '../components/NuevoProyecto';
import api from '../api/axiosInstance';

const COLORS_ESTADO = {
  Completado: '#22C55E',
  En_Proceso: '#3B82F6',
  Aprobado: '#A855F7',
  Caso_de_Negocio: '#F59E0B',
  En_Pausa: '#EF4444'
};

const Dashboard = () => {
  const [proyectos, setProyectos] = useState([]);
  const [kpiData, setKpiData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Criterio de ordenamiento para tarjetas
  const [criterioOrden, setCriterioOrden] = useState('fecha_desc');

  // Filtros de búsqueda y estado
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  const navigate = useNavigate();

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);

      const [resProyectos, resKpis] = await Promise.all([
        api.get('/proyectos'),
        api.get('/dashboard/kpis').catch(() => ({ data: null }))
      ]);

      // 1. Extracción segura de la lista de proyectos
      const dataProyectosRes = resProyectos.data;
      let listaProyectos = [];
      if (Array.isArray(dataProyectosRes)) {
        listaProyectos = dataProyectosRes;
      } else if (dataProyectosRes && Array.isArray(dataProyectosRes.data)) {
        listaProyectos = dataProyectosRes.data;
      } else if (dataProyectosRes && Array.isArray(dataProyectosRes.proyectos)) {
        listaProyectos = dataProyectosRes.proyectos;
      }
      setProyectos(listaProyectos);

      // 2. Cálculo robusto de KPIs y Gráficos basado en los proyectos reales
      const totalProyectos = listaProyectos.length;
      let sumaAvance = 0;
      let presupuestoTotal = 0;
      let costoRealTotal = 0;

      const estadosMap = {
        Aprobado: 0,
        En_Proceso: 0,
        Completado: 0,
        Caso_de_Negocio: 0,
        En_Pausa: 0
      };

      const departamentosMap = {};

      listaProyectos.forEach(p => {
        // Avance
        const avance = Number(p.porcentaje_avance || 0);
        sumaAvance += avance;

        // Conversión robusta de presupuesto (maneja strings como "15000")
        const presupuestoProyecto = Number(
          p.presupuesto !== undefined && p.presupuesto !== null ? p.presupuesto :
          (p.presupuesto_estimado ?? p.presupuestoEstimado ?? 0)
        );

        // Costo real (con respaldo calculado según avance si la API no lo trae explícito)
        const costoProyecto = Number(
          p.costo_real !== undefined && p.costo_real !== null ? p.costo_real :
          p.costoReal !== undefined && p.costoReal !== null ? p.costoReal :
          p.costo_ejecutado !== undefined && p.costo_ejecutado !== null ? p.costo_ejecutado :
          p.gasto_real !== undefined && p.gasto_real !== null ? p.gasto_real :
          p.costo !== undefined && p.costo !== null ? p.costo :
          (presupuestoProyecto * (avance / 100))
        );

        presupuestoTotal += presupuestoProyecto;
        costoRealTotal += costoProyecto;

        // Estado general
        const est = (p.estado || '').trim();
        if (est === 'Aprobado') estadosMap.Aprobado++;
        else if (['En Proceso', 'En-Proceso', 'En_Proceso', 'EnProceso'].includes(est)) estadosMap.En_Proceso++;
        else if (est === 'Completado') estadosMap.Completado++;
        else if (['Caso de Negocio', 'Caso-de-Negocio', 'Caso_de_Negocio', 'CasoDeNegocio'].includes(est)) estadosMap.Caso_de_Negocio++;
        else if (['En Pausa', 'En-Pausa', 'En_Pausa', 'EnPausa'].includes(est)) estadosMap.En_Pausa++;

        // Departamento
        const depto = 
          p.solicitante?.departamento || 
          p.area || 
          p.departamento || 
          p.nombre_departamento || 
          p.gerencia || 
          'General';

        if (!departamentosMap[depto]) {
          departamentosMap[depto] = {
            departamento: depto,
            cantidad: 0,
            presupuesto: 0,
            costo_real: 0,
            Aprobado: 0,
            En_Proceso: 0,
            Completado: 0,
            Caso_de_Negocio: 0,
            En_Pausa: 0
          };
        }

        departamentosMap[depto].cantidad += 1;
        departamentosMap[depto].presupuesto += presupuestoProyecto;
        departamentosMap[depto].costo_real += costoProyecto;

        if (est === 'Aprobado') departamentosMap[depto].Aprobado++;
        else if (['En Proceso', 'En-Proceso', 'En_Proceso', 'EnProceso'].includes(est)) departamentosMap[depto].En_Proceso++;
        else if (est === 'Completado') departamentosMap[depto].Completado++;
        else if (['Caso de Negocio', 'Caso-de-Negocio', 'Caso_de_Negocio', 'CasoDeNegocio'].includes(est)) departamentosMap[depto].Caso_de_Negocio++;
        else if (['En Pausa', 'En-Pausa', 'En_Pausa', 'EnPausa'].includes(est)) departamentosMap[depto].En_Pausa++;
      });

      const avancePromedio = totalProyectos > 0 ? Math.round(sumaAvance / totalProyectos) : 0;
      const ejecucionFinanciera = presupuestoTotal > 0 ? Math.round((costoRealTotal / presupuestoTotal) * 100) : 0;

      const proyectosPorEstado = Object.keys(estadosMap).map(est => ({
        estado: est,
        cantidad: estadosMap[est]
      })).filter(item => item.cantidad > 0);

      const porDepartamento = Object.values(departamentosMap);

      setKpiData({
        kpis: {
          totalProyectos,
          avancePromedio,
          presupuestoTotal,
          costoRealTotal,
          ejecucionFinanciera
        },
        proyectosPorEstado,
        porDepartamento
      });

      setError('');
    } catch (err) {
      const mensaje = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(mensaje || 'Error al conectar con el servidor.');

      if (err.response?.status === 401 || err.response?.status === 403 || mensaje?.includes("Token")) {
        localStorage.clear();
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleProyectoCreado = () => {
    cargarDatos();
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val || 0);

  const ordenarProyectos = (lista) => {
    if (!Array.isArray(lista)) return [];

    return [...lista].sort((a, b) => {
      switch (criterioOrden) {
        case 'nombre_asc':
          return (a.nombre || a.titulo || '').localeCompare(b.nombre || b.titulo || '');

        case 'nombre_desc':
          return (b.nombre || b.titulo || '').localeCompare(a.nombre || a.titulo || '');

        case 'presupuesto_desc':
          return (Number(b.presupuesto_estimado || b.presupuesto) || 0) - (Number(a.presupuesto_estimado || a.presupuesto) || 0);

        case 'presupuesto_asc':
          return (Number(a.presupuesto_estimado || a.presupuesto) || 0) - (Number(b.presupuesto_estimado || b.presupuesto) || 0);

        case 'fecha_asc':
          return new Date(a.fecha_creacion || a.createdAt || 0) - new Date(b.fecha_creacion || b.createdAt || 0);

        case 'fecha_desc':
        default:
          return new Date(b.fecha_creacion || b.createdAt || 0) - new Date(a.fecha_creacion || a.createdAt || 0);
      }
    });
  };

  const proyectosFiltrados = proyectos.filter((proyecto) => {
    const cumpleBusqueda = 
      (proyecto.nombre && proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (proyecto.codigo && proyecto.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (proyecto.descripcion && proyecto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

    const cumpleEstado = filtroEstado === 'TODOS' || proyecto.estado === filtroEstado;

    return cumpleBusqueda && cumpleEstado;
  });

  return (
    <div className="min-h-screen bg-[#0B0A0F] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        
        {/* Botones de acción principales de la vista (El Navbar Global maneja el título y usuario arriba) */}
        <div className="flex justify-end items-center gap-3 mb-8 pt-2">
          <button
            onClick={() => navigate('/iniciativas')}
            className="text-xs bg-[#13111C] border border-[#A855F7]/40 hover:border-[#A855F7] text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-md flex items-center gap-2"
          >
            📂 Portafolio
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs bg-gradient-to-r from-[#A855F7] to-[#7C3AED] hover:from-[#9333EA] hover:to-[#6D28D9] text-white font-bold px-4 py-2 rounded-lg transition-all shadow-lg"
          >
            + Nueva Iniciativa
          </button>
        </div>

        {error && (
          <div className="bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171] p-4 rounded-xl text-sm mb-6">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-[#94A3B8] text-center">Cargando métricas e iniciativas...</p>
          </div>
        ) : (
          <>
            {kpiData && (
              <div className="space-y-6 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#13111C] border border-[#2D2845] p-5 rounded-xl shadow-lg">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Total Iniciativas</p>
                    <p className="text-3xl font-black text-white mt-2">
                      {kpiData.kpis?.totalProyectos ?? 0}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] mt-1">Registradas en el portafolio</p>
                  </div>

                  <div className="bg-[#13111C] border border-[#2D2845] p-5 rounded-xl shadow-lg">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Avance Promedio</p>
                    <p className="text-3xl font-black text-[#A855F7] mt-2">
                      {kpiData.kpis?.avancePromedio ?? 0}%
                    </p>
                    <div className="w-full bg-[#2D2845] h-2 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-[#A855F7] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(kpiData.kpis?.avancePromedio || 0, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-[#13111C] border border-[#2D2845] p-5 rounded-xl shadow-lg">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Presupuesto Total</p>
                    <p className="text-xl font-bold text-[#22C55E] mt-2">
                      {formatCurrency(kpiData.kpis?.presupuestoTotal)}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] mt-1">Asignado a iniciativas</p>
                  </div>

                  <div className="bg-[#13111C] border border-[#2D2845] p-5 rounded-xl shadow-lg">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Ejecución Financiera</p>
                    <p className="text-xl font-bold text-amber-400 mt-2">
                      {kpiData.kpis?.ejecucionFinanciera ?? 0}%
                    </p>
                    <p className="text-[11px] text-[#94A3B8] mt-1">
                      Costo Real: {formatCurrency(kpiData.kpis?.costoRealTotal)}
                    </p>
                  </div>
                </div>

                {/* SECCIÓN DE GRÁFICOS */}
                <div className="space-y-6">
                  
                  {/* Fila Superior */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Gráfico 1: Estado de Proyectos (Pie) */}
                    <div className="bg-[#13111C] border border-[#2D2845] p-5 rounded-xl shadow-lg">
                      <h2 className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-4">
                        Estado de Proyectos
                      </h2>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={kpiData.proyectosPorEstado || []}
                              dataKey="cantidad"
                              nameKey="estado"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={4}
                            >
                              {(kpiData.proyectosPorEstado || []).map((entry) => (
                                <Cell
                                  key={`cell-${entry.estado}`}
                                  fill={COLORS_ESTADO[entry.estado] || '#64748B'}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: '#13111C', borderColor: '#2D2845', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Gráfico 2: Presupuesto vs Costo Real */}
                    <div className="bg-[#13111C] border border-[#2D2845] p-5 rounded-xl shadow-lg">
                      <h2 className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-4">
                        Presupuesto vs. Costo Real por Departamento
                      </h2>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={kpiData.porDepartamento || []} margin={{ top: 10, right: 10, left: 15, bottom: 25 }}>
                            <XAxis
                              dataKey="departamento"
                              stroke="#64748B"
                              fontSize={10}
                              interval={0}
                              angle={-20}
                              textAnchor="end"
                            />
                            <YAxis
                              stroke="#64748B"
                              fontSize={10}
                              tickFormatter={(val) => `$${val / 1000000}M`}
                            />
                            <Tooltip
                              formatter={(value) => formatCurrency(Number(value))}
                              contentStyle={{ backgroundColor: '#13111C', borderColor: '#2D2845', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} verticalAlign="top" />
                            <Bar dataKey="presupuesto" name="Presupuesto" fill="#22C55E" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="costo_real" name="Costo Real" fill="#A855F7" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>

                  {/* Fila Inferior: Iniciativas por Departamento Apiladas por Estado */}
                  <div className="bg-[#13111C] border border-[#2D2845] p-5 rounded-xl shadow-lg w-full">
                    <h2 className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-4">
                      Iniciativas por Departamento (Desglose por Estado)
                    </h2>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={kpiData?.porDepartamento || []} 
                          margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
                        >
                          <XAxis
                            dataKey="departamento"
                            stroke="#64748B"
                            fontSize={10}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                          />
                          <YAxis
                            stroke="#64748B"
                            fontSize={10}
                            allowDecimals={false}
                          />
                          <Tooltip
                            formatter={(value, name) => [`${value} iniciativas`, name]}
                            contentStyle={{ 
                              backgroundColor: '#13111C', 
                              borderColor: '#2D2845', 
                              borderRadius: '8px', 
                              color: '#fff', 
                              fontSize: '12px' 
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} verticalAlign="top" />
                          
                          <Bar dataKey="Aprobado" name="Aprobado" stackId="a" fill={COLORS_ESTADO.Aprobado} />
                          <Bar dataKey="En_Proceso" name="En Proceso" stackId="a" fill={COLORS_ESTADO.En_Proceso} />
                          <Bar dataKey="Completado" name="Completado" stackId="a" fill={COLORS_ESTADO.Completado} />
                          <Bar dataKey="Caso_de_Negocio" name="Caso de Negocio" stackId="a" fill={COLORS_ESTADO.Caso_de_Negocio} />
                          <Bar dataKey="En_Pausa" name="En Pausa" stackId="a" fill={COLORS_ESTADO.En_Pausa} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* SECCIÓN DE FILTROS Y TARJETAS */}
            <div className="border-t border-[#2D2845] pt-6">
              
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-[#13111C] border border-[#2D2845] p-4 rounded-xl">
                <div className="w-full md:w-1/2">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, código o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0B0A0F] border border-[#2D2845] rounded-lg px-4 py-2 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#A855F7] transition-all"
                  />
                </div>

                <div className="w-full md:w-1/2 flex flex-wrap items-center justify-end gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#94A3B8] font-semibold whitespace-nowrap">Estado:</span>
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="bg-[#0B0A0F] border border-[#2D2845] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#A855F7] transition-all"
                    >
                      <option value="TODOS">Todos los estados</option>
                      <option value="Caso_de_Negocio">Caso de Negocio</option>
                      <option value="Aprobado">Aprobado</option>
                      <option value="En_Proceso">En Proceso</option>
                      <option value="Completado">Completado</option>
                      <option value="En_Pausa">En Pausa</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      id="ordenar-dash"
                      value={criterioOrden}
                      onChange={(e) => setCriterioOrden(e.target.value)}
                      className="bg-[#0B0A0F] border border-[#2D2845] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#A855F7]"
                    >
                      <option value="fecha_desc">📅 Más recientes</option>
                      <option value="fecha_asc">📅 Más antiguas</option>
                      <option value="nombre_asc">🔤 Nombre (A - Z)</option>
                      <option value="nombre_desc">🔤 Nombre (Z - A)</option>
                      <option value="presupuesto_desc">💰 Mayor Presupuesto</option>
                      <option value="presupuesto_asc">💰 Menor Presupuesto</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  📋 Iniciativas Recientes <span className="text-xs text-[#A855F7] font-normal">({proyectosFiltrados.length} encontradas)</span>
                </h2>

                <Link
                  to="/iniciativas?filtro=en_estudio"
                  className="text-xs text-[#A855F7] hover:text-[#9333EA] font-semibold transition-colors flex items-center gap-1"
                >
                  Ver portafolio completo →
                </Link>
              </div>

              {proyectos.length === 0 ? (
                <div className="text-center py-16 bg-[#13111C] border border-[#2D2845] rounded-xl">
                  <p className="text-[#94A3B8] text-sm">No hay iniciativas registradas en el PMO actualmente.</p>
                </div>
              ) : proyectosFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-[#13111C] border border-[#2D2845] rounded-xl">
                  <p className="text-[#94A3B8] text-sm">No se encontraron iniciativas con los filtros seleccionados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ordenarProyectos(proyectosFiltrados).map((proyecto) => (
                    <div 
                      key={proyecto.id || proyecto.id_iniciativa} 
                      onClick={() => navigate(`/proyectos/${proyecto.id || proyecto.id_iniciativa}`)}
                      className="cursor-pointer relative bg-[#13111C] border border-[#2D2845] rounded-xl p-5 shadow-lg hover:border-[#A855F7]/80 hover:scale-[1.01] transition-all duration-300 overflow-hidden"
                    >
                      <div className="mt-2">
                        <h3 className="text-lg font-bold text-white mb-2">{proyecto.nombre || proyecto.titulo}</h3>
                        <p className="text-xs text-[#94A3B8] line-clamp-3 mb-4">
                          {proyecto.descripcion || 'Sin descripción.'}
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] uppercase font-semibold tracking-wider pt-4 border-t border-[#2D2845]">
                        <span className="text-[#94A3B8]">Código: {proyecto.codigo || 'N/A'}</span>
                        
                        <span className={`px-2.5 py-0.5 rounded-full border ${
                          proyecto.estado === 'Aprobado' || proyecto.estado === 'Completado' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30' :
                          proyecto.estado === 'Evaluacion' || proyecto.estado === 'En_Proceso' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                          proyecto.estado === 'Caso_de_Negocio' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-gray-500/10 target:bg-gray-400 border-gray-500/30 text-gray-400'
                        }`}>
                          {proyecto.estado || 'Idea'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>

      <NuevoProyecto
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProyectoCreado={handleProyectoCreado}
      />
    </div>
  );
};

export default Dashboard;