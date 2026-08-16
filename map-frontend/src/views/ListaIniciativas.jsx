import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, AlertCircle, ArrowUpDown, ArrowLeft } from 'lucide-react';
import api from '../api/axiosInstance';
import { extraerLista, manejarOrdenamiento } from '../utils/pmoHelpers';

const ListaIniciativas = () => {
  const [iniciativas, setIniciativas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [procesandoId, setProcesandoId] = useState(null);
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  
  // Estados para el ordenamiento dinámico por columnas
  const [columnaOrden, setColumnaOrden] = useState('fecha');
  const [direccion, setDireccion] = useState('desc');

  const navigate = useNavigate();

  // Obtenemos el usuario logueado almacenado al iniciar sesión
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuario')) || {};
  
  // Definimos qué roles tienen privilegios para cambiar estados o ver acciones avanzadas
  // Administrador y Líder de PMO tienen acceso total; Analista y Revisor/Sponsor tienen menos privilegios.
  const tienePrivilegiosAltos = ['ADMINISTRADOR', 'LIDER_PMO'].includes(usuarioLogueado.rol);

  const cargarIniciativas = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const response = await api.get('/proyectos');
      const listaExtraida = extraerLista(response.data);
      setIniciativas(listaExtraida);
    } catch (err) {
      console.error("Error al cargar proyectos:", err);
      setError("No se pudieron cargar las iniciativas. Verifica el servidor.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarIniciativas();
  }, [cargarIniciativas]);

  const cambiarEstadoIniciativa = async (itemId, nuevoEstado) => {
    try {
      setProcesandoId(itemId);
      await api.patch(`/proyectos/${itemId}/estado`, { nuevoEstado });
      
      setIniciativas(prev => 
        prev.map(item => {
          const currentId = item.id || item.id_iniciativa || item._id;
          return currentId === itemId ? { ...item, estado: nuevoEstado } : item;
        })
      );
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("Error al cambiar el estado de la iniciativa.");
    } finally {
      setProcesandoId(null);
    }
  };

  const toggleOrden = (columna) => {
    if (columnaOrden === columna) {
      setDireccion(direccion === 'asc' ? 'desc' : 'asc');
    } else {
      setColumnaOrden(columna);
      setDireccion('asc');
    }
  };

  // 1. Filtrado de iniciativas
  const iniciativasFiltradas = iniciativas.filter(item => {
    const texto = busqueda.toLowerCase();
    const nombre = item.nombre || item.titulo || item.name || '';
    const desc = item.descripcion || item.description || '';
    const area = item.area || item.departamento || item.solicitante?.area || item.solicitante?.departamento || '';

    const cumpleBusqueda = (
      nombre.toLowerCase().includes(texto) ||
      desc.toLowerCase().includes(texto) ||
      area.toLowerCase().includes(texto)
    );
    const cumpleFiltro = filtroEstado === 'TODOS' || item.estado === filtroEstado;
    return cumpleBusqueda && cumpleFiltro;
  });

  // 2. Aplicamos ordenamiento sobre el resultado filtrado
  const iniciativasMostradas = manejarOrdenamiento(iniciativasFiltradas, columnaOrden, direccion);

  if (cargando && iniciativas.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-white bg-[#0B0A0F]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A855F7] mr-3"></div>
        <span>Cargando iniciativas...</span>
      </div>
    );
  }

  return (
    <div className="p-6 text-white max-w-7xl mx-auto min-h-screen bg-[#0B0A0F]">
      {/* Botón de Volver al Dashboard y Encabezado */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white bg-[#13111C] border border-[#2D2845] px-3 py-1.5 rounded-lg mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al Dashboard
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="text-[#A855F7]" /> Lista de Iniciativas / Proyectos
            </h1>
            <p className="text-gray-400 text-sm">Gestiona el estado y el flujo de tus proyectos en curso.</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
              <input 
                type="text"
                placeholder="Buscar iniciativa o área..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-[#13111C] border border-[#2D2845] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A855F7]"
              />
            </div>

            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="bg-[#13111C] border border-[#2D2845] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#A855F7]"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="Caso_de_Negocio">Caso de Negocio</option>
              <option value="Aprobado">Aprobado</option>
              <option value="En_Proceso">En Proceso</option>
              <option value="En_Pausa">En Pausa</option>
              <option value="Completado">Completado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-[#13111C] border border-[#2D2845] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2D2845] bg-[#0B0A0F] text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => toggleOrden('nombre')}>
                  <div className="flex items-center gap-1.5">
                    Proyecto 
                    <ArrowUpDown className={`w-3 h-3 ${columnaOrden === 'nombre' ? 'text-[#A855F7]' : 'text-gray-500'}`} />
                    {columnaOrden === 'nombre' && (direccion === 'asc' ? '▲' : '▼')}
                  </div>
                </th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => toggleOrden('area')}>
                  <div className="flex items-center gap-1.5">
                    Área / Depto 
                    <ArrowUpDown className={`w-3 h-3 ${columnaOrden === 'area' ? 'text-[#A855F7]' : 'text-gray-500'}`} />
                    {columnaOrden === 'area' && (direccion === 'asc' ? '▲' : '▼')}
                  </div>
                </th>
                <th className="p-4">Descripción</th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => toggleOrden('fecha')}>
                  <div className="flex items-center gap-1.5">
                    Fecha Inicio 
                    <ArrowUpDown className={`w-3 h-3 ${columnaOrden === 'fecha' ? 'text-[#A855F7]' : 'text-gray-500'}`} />
                    {columnaOrden === 'fecha' && (direccion === 'asc' ? '▲' : '▼')}
                  </div>
                </th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => toggleOrden('estado')}>
                  <div className="flex items-center gap-1.5">
                    Estado Actual 
                    <ArrowUpDown className={`w-3 h-3 ${columnaOrden === 'estado' ? 'text-[#A855F7]' : 'text-gray-500'}`} />
                    {columnaOrden === 'estado' && (direccion === 'asc' ? '▲' : '▼')}
                  </div>
                </th>
                {/* Ocultamos o adaptamos la columna de acciones si no tiene privilegios */}
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2845] text-sm">
              {iniciativasMostradas.length > 0 ? (
                iniciativasMostradas.map((item) => {
                  const itemId = item.id || item.id_iniciativa || item._id;
                  const nombreProyecto = item.nombre || item.titulo || item.name || 'Sin Nombre';
                  const areaDepto = item.area || item.departamento || item.depto || item.solicitante?.area || item.solicitante?.departamento || item.solicitante?.nombre || 'N/A';
                  const descripcion = item.descripcion || item.description || 'Sin descripción';
                  const fecha = item.fecha_inicio || item.fecha_creacion || item.createdAt || item.fecha;

                  return (
                    <tr 
                      key={itemId} 
                      className="hover:bg-[#1A1726]/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/proyectos/${itemId}`)}
                    >
                      <td className="p-4 font-medium text-white">
                        {nombreProyecto}
                      </td>
                      <td className="p-4 text-purple-300 font-medium text-xs">
                        {areaDepto}
                      </td>
                      <td className="p-4 text-gray-400 max-w-xs truncate text-xs">
                        {descripcion}
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        {fecha ? new Date(fecha).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                          item.estado === 'Aprobado' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          item.estado === 'En_Proceso' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          item.estado === 'Completado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          item.estado === 'Caso_de_Negocio' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          item.estado === 'En_Pausa' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {item.estado === 'Caso_de_Negocio' ? 'Caso de Negocio' : 
                           item.estado === 'En_Proceso' ? 'En Proceso' : 
                           item.estado === 'En_Pausa' ? 'En Pausa' : 
                           item.estado || 'Caso de Negocio'}
                        </span>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {tienePrivilegiosAltos ? (
                          /* Selector habilitado solo para Administrador y Líder de PMO */
                          <select
                            disabled={procesandoId === itemId}
                            value={item.estado || 'Caso_de_Negocio'}
                            onChange={(e) => cambiarEstadoIniciativa(itemId, e.target.value)}
                            className="bg-[#0B0A0F] text-white border border-[#2D2845] rounded-md px-2 py-1 text-xs focus:outline-none focus:border-[#A855F7] cursor-pointer disabled:opacity-50"
                          >
                            <option value="Caso_de_Negocio">Caso de Negocio</option>
                            <option value="Aprobado">Aprobado</option>
                            <option value="En_Proceso">En Proceso</option>
                            <option value="En_Pausa">En Pausa</option>
                            <option value="Completado">Completado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        ) : (
                          /* Si no tiene privilegios, no se renderiza nada en la columna de acciones */
                          null
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 text-xs">
                    No se encontraron iniciativas registradas o que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListaIniciativas;