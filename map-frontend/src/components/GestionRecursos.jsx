import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Trash2, Shield, Percent, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/axiosInstance';

const GestionRecursos = ({ idProyecto, tienePrivilegios }) => {
  const [recursos, setRecursos] = useState([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Formulario
  const [idUsuarioSel, setIdUsuarioSel] = useState('');
  const [rolProyecto, setRolProyecto] = useState('');
  const [porcentajeDedicacion, setPorcentajeDedicacion] = useState(100);

  // 1. Cargar recursos asignados y lista de usuarios del sistema
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      const [resRecursos, resUsuarios] = await Promise.all([
        api.get(`/recursos/proyecto/${idProyecto}`),
        api.get('/usuarios') // Endpoint para seleccionar miembros
      ]);

      const listaRecursos = resRecursos.data.data || [];
      const listaUsuarios = resUsuarios.data.data || resUsuarios.data || [];

      setRecursos(listaRecursos);
      setUsuariosDisponibles(listaUsuarios);
    } catch (err) {
      console.error("Error al cargar recursos:", err);
    } finally {
      setCargando(false);
    }
  }, [idProyecto]);

  useEffect(() => {
    if (idProyecto) {
      cargarDatos();
    }
  }, [idProyecto, cargarDatos]);

  // 2. Asignar nuevo recurso al proyecto
  const handleAsignar = async (e) => {
    e.preventDefault();
    if (!idUsuarioSel || !rolProyecto) {
      setMensaje({ tipo: 'error', texto: 'Selecciona un usuario y especifica su rol.' });
      return;
    }

    try {
      setProcesando(true);
      setMensaje(null);

      await api.post(`/recursos/proyecto/${idProyecto}`, {
        id_usuario: Number(idUsuarioSel),
        rol_proyecto: rolProyecto,
        porcentaje_dedicacion: Number(porcentajeDedicacion)
      });

      setMensaje({ tipo: 'exito', texto: 'Recurso asignado correctamente al equipo.' });
      setIdUsuarioSel('');
      setRolProyecto('');
      setPorcentajeDedicacion(100);
      
      cargarDatos();
    } catch (err) {
      console.error("Error al asignar recurso:", err);
      setMensaje({ tipo: 'error', texto: err.response?.data?.message || 'Error al asignar el recurso.' });
    } finally {
      setProcesando(false);
    }
  };

  // 3. Remover un recurso del proyecto
  const handleDesasignar = async (idAsignacion) => {
    if (!window.confirm('¿Seguro que deseas remover este integrante del equipo?')) return;

    try {
      setProcesando(true);
      await api.delete(`/recursos/${idAsignacion}`);
      setMensaje({ tipo: 'exito', texto: 'Integrante removido del equipo.' });
      cargarDatos();
    } catch (err) {
      console.error("Error al remover recurso:", err);
      setMensaje({ tipo: 'error', texto: 'No se pudo remover el integrante.' });
    } finally {
      setProcesando(false);
    }
  };

  // Cálculo de carga de trabajo total asignada
  const dedicacionTotal = recursos.reduce((acc, curr) => acc + (Number(curr.porcentaje_dedicacion) || 0), 0);

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-12 text-gray-400">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A855F7] mr-3"></div>
        <span>Cargando equipo y asignaciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de Carga y Capacidad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl">
          <p className="text-gray-400 text-xs">Total Integrantes</p>
          <p className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#A855F7]" /> {recursos.length}
          </p>
        </div>

        <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl">
          <p className="text-gray-400 text-xs">Carga Total de Tiempo (FTE Sum)</p>
          <p className="text-2xl font-bold text-purple-300 mt-1 flex items-center gap-2">
            <Percent className="w-5 h-5 text-purple-400" /> {dedicacionTotal}%
          </p>
        </div>

        <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl">
          <p className="text-gray-400 text-xs">Capacidad Promedio / Integrante</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {recursos.length > 0 ? (dedicacionTotal / recursos.length).toFixed(0) : 0}%
          </p>
        </div>
      </div>

      {mensaje && (
        <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
          mensaje.tipo === 'exito' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {mensaje.tipo === 'exito' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* Formulario de Asignación (Solo para roles con privilegios) */}
      {tienePrivilegios && (
        <form onSubmit={handleAsignar} className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#A855F7]" /> Asignar Nuevo Integrante
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Miembro del Equipo</label>
              <select
                value={idUsuarioSel}
                onChange={(e) => setIdUsuarioSel(e.target.value)}
                className="w-full bg-[#0B0A0F] border border-[#2D2845] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#A855F7]"
              >
                <option value="">Seleccionar Usuario...</option>
                {usuariosDisponibles.map(usr => (
                  <option key={usr.id} value={usr.id}>
                    {usr.nombre} ({usr.correo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Rol en el Proyecto</label>
              <input
                type="text"
                placeholder="Ej. Lead Developer, QA, Scrum Master"
                value={rolProyecto}
                onChange={(e) => setRolProyecto(e.target.value)}
                className="w-full bg-[#0B0A0F] border border-[#2D2845] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#A855F7]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Dedicación (%)</label>
              <input
                type="number"
                min="5"
                max="100"
                step="5"
                value={porcentajeDedicacion}
                onChange={(e) => setPorcentajeDedicacion(e.target.value)}
                className="w-full bg-[#0B0A0F] border border-[#2D2845] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#A855F7]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={procesando}
              className="bg-[#A855F7] hover:bg-[#9333EA] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              {procesando ? 'Asignando...' : 'Asignar Recurso'}
            </button>
          </div>
        </form>
      )}

      {/* Tabla de Integrantes Asignados */}
      <div className="bg-[#13111C] border border-[#2D2845] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#2D2845]">
          <h3 className="text-sm font-semibold text-white">Equipo Asignado al Proyecto</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2D2845] bg-[#0B0A0F] text-gray-400 uppercase">
                <th className="p-3">Nombre / Usuario</th>
                <th className="p-3">Rol en Proyecto</th>
                <th className="p-3">Dedicación</th>
                <th className="p-3">Fecha Asignación</th>
                {tienePrivilegios && <th className="p-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2845]">
              {recursos.length > 0 ? (
                recursos.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1A1726]/50 transition-colors">
                    <td className="p-3 text-white font-medium">
                      {item.usuario?.nombre || 'Usuario Desconocido'}
                      <span className="block text-[10px] text-gray-500">{item.usuario?.correo}</span>
                    </td>
                    <td className="p-3 text-purple-300">
                      <span className="inline-flex items-center gap-1 bg-[#1e1b2e] border border-[#A855F7]/30 px-2 py-0.5 rounded text-[11px]">
                        <Shield className="w-3 h-3 text-[#A855F7]" />
                        {item.rol_proyecto}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#0B0A0F] border border-[#2D2845] rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-[#A855F7] h-full rounded-full" 
                            style={{ width: `${Math.min(item.porcentaje_dedicacion, 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-xs">{item.porcentaje_dedicacion}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-400">
                      {item.creado_en ? new Date(item.creado_en).toLocaleDateString() : 'N/A'}
                    </td>
                    {tienePrivilegios && (
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDesasignar(item.id)}
                          disabled={procesando}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors"
                          title="Remover del equipo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={tienePrivilegios ? 5 : 4} className="p-6 text-center text-gray-500">
                    Aún no hay recursos o integrantes asignados a este proyecto.
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

export default GestionRecursos;