import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Mapeo de colores alineado con la paleta de MAP PMO
const COLORS_ESTADO = {
  Completado: '#22C55E',     // Verde
  En_Proceso: '#3B82F6',     // Azul
  Aprobado: '#A855F7',       // Púrpura
  Caso_de_Negocio: '#F59E0B',// Ámbar
  En_Pausa: '#EF4444'        // Rojo
};

const Dashboard = () => {
  const [proyectos, setProyectos] = useState([]);
  const [kpiData, setKpiData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const usuarioString = localStorage.getItem('usuario');
  const usuario = usuarioString ? JSON.parse(usuarioString) : null;

  useEffect(() => {
    let isMounted = true;

    const cargarDatos = async () => {
      try {
        setLoading(true);

        // Peticiones en paralelo: Proyectos + KPIs del Dashboard
        const [resProyectos, resKpis] = await Promise.all([
          api.get('/proyectos'),
          api.get('/dashboard/kpis')
        ]);

        if (!isMounted) return;

        // Procesa proyectos
        const dataProyectos = resProyectos.data;
        if (Array.isArray(dataProyectos)) {
          setProyectos(dataProyectos);
        } else if (dataProyectos && Array.isArray(dataProyectos.data)) {
          setProyectos(dataProyectos.data);
        } else if (dataProyectos && Array.isArray(dataProyectos.proyectos)) {
          setProyectos(dataProyectos.proyectos);
        } else {
          setProyectos([]);
        }

        // Procesa KPIs
        if (resKpis.data && resKpis.data.success) {
          setKpiData(resKpis.data.data);
        }

        setError('');
      } catch (err) {
        if (!isMounted) return;

        const mensaje = err.response?.data?.message || err.response?.data?.error || err.message;
        setError(mensaje || 'Error al conectar con el servidor.');

        if (err.response?.status === 401 || err.response?.status === 403 || mensaje?.includes("Token")) {
          localStorage.clear();
          navigate('/');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    cargarDatos();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleProyectoCreado = (nuevoProyecto) => {
    setProyectos((prevProyectos) => [nuevoProyecto, ...prevProyectos]);
  };

  // Formateador de moneda en pesos (COP)
  const formatCurrency = (val) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);

  return (
    <div className="min-h-screen bg-[#0B0A0F] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        
        {/* Encabezado Principal */}
        <div className="flex justify-between items-center mb-8 border-b border-[#2D2845] pb-4">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#22C55E]">
              🚀 MAP PMO - DASHBOARD
            </h1>
            {usuario && (
              <p className="text-[#94A3B8] text-sm mt-1">
                Bienvenido de vuelta, <span className="text-[#A855F7] font-bold">{usuario.nombre || usuario.correo}</span>
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs bg-gradient-to-r from-[#A855F7] to-[#7C3AED] hover:from-[#9333EA] hover:to-[#6D28D9] text-white font-bold px-4 py-2 rounded-lg transition-all shadow-lg"
            >
              + Nueva Iniciativa
            </button>
            <button 
              onClick={handleLogout}
              className="text-xs bg-[#EF4444]/20 border border-[#EF4444]/40 hover:bg-[#EF4444] text-white px-4 py-2 rounded-lg transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171] p-4 rounded-xl text-sm mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Carga General */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-[#94A3B8] text-center">Cargando métricas e iniciativas...</p>
          </div>
        ) : (
          <>
            {/* SECCIÓN 1: TARJETAS DE KPIS */}
            {kpiData && (
              <div className="space-y-6 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* KPI 1 */}
                  <div className="bg-[#13111C] border border-[#2D2845] p-5 rounded-xl shadow-lg">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Total Iniciativas</p>
                    <p className="text-3xl font-black text-white mt-2">
                      {kpiData.kpis.totalProyectos}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] mt-1">Registradas en el portafolio</p>
                  </div>

                  {/* KPI 2 */}
                  <div className="bg-[#13111C] border border-[#2D2845] p-5 rounded-xl shadow-lg">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Avance Promedio</p>
                    <p className="text-3xl font-black text-[#A855F7] mt-2">
                      {kpiData.kpis.avancePromedio}%
                    </p>
                    <div className="w-full bg-[#2D2845] h-2 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-[#A855F7] h-full rounded-full transition-all duration-500"
                        style={{ width: `${kpiData.kpis.avancePromedio}%` }}
                      />
                    </div>
                  </div>

                  {/* KPI 3 */}
                  <div className="bg-[#13111C] border border-[#2D2845] p-5 rounded-xl shadow-lg">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Presupuesto Total</p>
                    <p className="text-xl font-bold text-[#22C55E] mt-2">
                      {formatCurrency(kpiData.kpis.presupuestoTotal)}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] mt-1">Asignado a iniciativas</p>
                  </div>

                  {/* KPI 4 */}
                  <div className="bg-[#13111C] border border-[#2D2845] p-5 rounded-xl shadow-lg">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Ejecución Financiera</p>
                    <p className="text-xl font-bold text-amber-400 mt-2">
                      {kpiData.kpis.ejecucionFinanciera}%
                    </p>
                    <p className="text-[11px] text-[#94A3B8] mt-1">
                      Costo Real: {formatCurrency(kpiData.kpis.costoRealTotal)}
                    </p>
                  </div>

                </div>

                {/* SECCIÓN 2: GRÁFICAS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Dona - Estado de Proyectos */}
                  <div className="bg-[#13111C] border border-[#2D2845] p-5 rounded-xl shadow-lg lg:col-span-1">
                    <h2 className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-4">
                      Estado de Proyectos
                    </h2>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={kpiData.proyectosPorEstado}
                            dataKey="cantidad"
                            nameKey="estado"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={75}
                            paddingAngle={4}
                          >
                            {kpiData.proyectosPorEstado.map((entry) => (
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

                  {/* Barras - Presupuesto vs Costo Real por Depto */}
                  <div className="bg-[#13111C] border border-[#2D2845] p-5 rounded-xl shadow-lg lg:col-span-2">
                    <h2 className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-4">
                      Presupuesto vs. Costo Real por Departamento
                    </h2>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={kpiData.porDepartamento} margin={{ top: 10, right: 10, left: 15, bottom: 25 }}>
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
              </div>
            )}

            {/* SECCIÓN 3: LISTADO DE INICIATIVAS */}
            <div className="border-t border-[#2D2845] pt-6">
              <h2 className="text-xl font-bold text-white mb-6">
                📋 Listado de Iniciativas
              </h2>

              {proyectos.length === 0 ? (
                <div className="text-center py-16 bg-[#13111C] border border-[#2D2845] rounded-xl">
                  <p className="text-[#94A3B8] text-sm">No hay iniciativas registradas en el PMO actualmente.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {proyectos.map((proyecto) => (
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
                          'bg-gray-500/10 text-gray-400 border-gray-500/30'
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