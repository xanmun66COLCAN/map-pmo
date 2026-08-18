import React, { useState, useEffect } from 'react';
import { UserPlus, ShieldCheck, FileText, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/axiosInstance'; // 👈 Usamos tu instancia centralizada con interceptores

const VistaAdministracion = () => {
  // Estados para la pestaña activa ('usuarios', 'gestion', 'auditoria')
  const [tabActiva, setTabActiva] = useState('usuarios');

  // Estados del formulario de creación de usuario
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    id_rol: '2' // Por defecto Rol 2 (ej. Líder de Proyecto)
  });
  const [mensajeUsuario, setMensajeUsuario] = useState(null);
  const [errorUsuario, setErrorUsuario] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Estados para la lista de usuarios activos (gestión de roles)
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [loadingLista, setLoadingLista] = useState(false);
  const [errorLista, setErrorLista] = useState(null);
  const [mensajeRol, setMensajeRol] = useState(null);

  // Estados para la auditoría
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [errorLogs, setErrorLogs] = useState(null);

  // Cargar datos al cambiar de pestaña
  useEffect(() => {
    if (tabActiva === 'gestion') {
      obtenerUsuariosActivos();
    } else if (tabActiva === 'auditoria') {
      obtenerLogsAuditoria();
    }
  }, [tabActiva]);

  // 📋 Obtener lista de usuarios activos para cambiar roles
  const obtenerUsuariosActivos = async () => {
    setLoadingLista(true);
    setErrorLista(null);
    try {
      const response = await api.get('/admin/usuarios');
      setListaUsuarios(response.data.usuarios || response.data);
    } catch (err) {
      setErrorLista(err.response?.data?.message || 'Error al obtener los usuarios activos.');
    } finally {
      setLoadingLista(false);
    }
  };

  // 🔄 Actualizar el rol de un usuario en tiempo real
  const handleCambiarRol = async (idUsuario, nuevoIdRol) => {
    setMensajeRol(null);
    try {
      await api.put(`/admin/usuarios/${idUsuario}/rol`, { id_rol: Number(nuevoIdRol) });
      setMensajeRol('¡Rol actualizado exitosamente!');
      obtenerUsuariosActivos(); // Recargamos la tabla
    } catch (err) {
      setErrorLista(err.response?.data?.message || 'Error al actualizar el rol.');
    }
  };

  // 📊 Obtener logs de auditoría
  const obtenerLogsAuditoria = async () => {
    setLoadingLogs(true);
    setErrorLogs(null);
    try {
      const response = await api.get('/admin/auditoria');
      setLogs(response.data);
    } catch (err) {
      setErrorLogs(err.response?.data?.message || 'Error al obtener los registros de auditoría.');
    } finally {
      setLoadingLogs(false);
    }
  };

  // ➕ Crear nuevo usuario
  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    setLoadingUser(true);
    setMensajeUsuario(null);
    setErrorUsuario(null);

    try {
      const response = await api.post('/admin/usuarios', formData);
      setMensajeUsuario('¡Usuario creado exitosamente con contraseña cifrada!');
      setFormData({ nombre: '', correo: '', contrasena: '', id_rol: '2' });
    } catch (err) {
      setErrorUsuario(err.response?.data?.message || 'Error al registrar el usuario.');
    } finally {
      setLoadingUser(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-[#2D2845]">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-[#22C55E]" />
            Panel de Administración & Auditoría
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Gestión de credenciales, privilegios de acceso y control de trazabilidad del sistema PMO.
          </p>
        </div>

        {/* Pestañas de Navegación Interna */}
        <div className="flex bg-[#13111C] p-1 rounded-xl border border-[#2D2845] gap-1">
          <button
            onClick={() => setTabActiva('usuarios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              tabActiva === 'usuarios'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Usuario</span>
          </button>
          
          <button
            onClick={() => setTabActiva('gestion')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              tabActiva === 'gestion'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestión de Roles</span>
          </button>

          <button
            onClick={() => setTabActiva('auditoria')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              tabActiva === 'auditoria'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Auditoría</span>
          </button>
        </div>
      </div>

      {/* Contenido Pestaña 1: Crear Usuarios */}
      {tabActiva === 'usuarios' && (
        <div className="max-w-xl mx-auto bg-[#13111C] border border-[#2D2845] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Registro de Nuevo Usuario</h2>
              <p className="text-xs text-gray-400">Asigne perfiles de acceso con encriptación segura.</p>
            </div>
          </div>

          {mensajeUsuario && (
            <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{mensajeUsuario}</span>
            </div>
          )}

          {errorUsuario && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorUsuario}</span>
            </div>
          )}

          <form onSubmit={handleCrearUsuario} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Ana Gómez"
                className="w-full bg-[#0B0A0F] border border-[#2D2845] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                placeholder="ejemplo@pmo.com"
                className="w-full bg-[#0B0A0F] border border-[#2D2845] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Contraseña Temporal</label>
              <input
                type="password"
                required
                value={formData.contrasena}
                onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-[#0B0A0F] border border-[#2D2845] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Rol en el Sistema</label>
              <select
                value={formData.id_rol}
                onChange={(e) => setFormData({ ...formData, id_rol: e.target.value })}
                className="w-full bg-[#0B0A0F] border border-[#2D2845] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="1">1 - Administrador</option>
                <option value="2">2 - Líder de Proyecto</option>
                <option value="3">3 - Analista PMO</option>
                <option value="4">4 - Sponsor</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loadingUser}
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              {loadingUser ? 'Registrando usuario...' : 'Crear Usuario'}
            </button>
          </form>
        </div>
      )}

      {/* Contenido Pestaña 2: Gestión de Roles (Usuarios Activos) */}
      {tabActiva === 'gestion' && (
        <div className="bg-[#13111C] border border-[#2D2845] rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Gestión de Usuarios y Roles</h2>
              <p className="text-xs text-gray-400">Modifique los privilegios de acceso de los usuarios activos en tiempo real.</p>
            </div>
            <button
              onClick={obtenerUsuariosActivos}
              className="px-3 py-1.5 bg-[#0B0A0F] border border-[#2D2845] hover:border-purple-500/40 text-purple-400 text-xs rounded-lg transition-colors"
            >
              Actualizar Lista
            </button>
          </div>

          {mensajeRol && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{mensajeRol}</span>
            </div>
          )}

          {loadingLista && (
            <p className="text-xs text-gray-400 text-center py-8">Cargando usuarios activos...</p>
          )}

          {errorLista && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs mb-4">
              {errorLista}
            </div>
          )}

          {!loadingLista && !errorLista && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0A0F] text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#2D2845]">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Correo</th>
                    <th className="py-3 px-4">Rol Actual</th>
                    <th className="py-3 px-4 text-center">Modificar Privilegio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D2845]/50 text-gray-300">
                  {listaUsuarios.length > 0 ? (
                    listaUsuarios.map((usr) => (
                      <tr key={usr.id} className="hover:bg-[#0B0A0F]/40 transition-colors">
                        {/* 👈 Corregido usr.id_usuario por usr.id */}
                        <td className="py-3 px-4 font-mono text-purple-400">#{usr.id}</td>
                        <td className="py-3 px-4 font-medium text-white">{usr.nombre}</td>
                        <td className="py-3 px-4 text-gray-400">{usr.correo}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {usr.rol?.nombre_rol || `Rol ID: ${usr.id_rol}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={usr.id_rol}
                            onChange={(e) => handleCambiarRol(usr.id, e.target.value)}
                            className="bg-[#0B0A0F] border border-[#2D2845] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                          >
                            <option value="1">1 - Administrador</option>
                            <option value="2">2 - Líder de Proyecto</option>
                            <option value="3">3 - Analista PMO</option>
                            <option value="4">4 - Sponsor</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-400">
                        No hay usuarios registrados en el sistema.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Contenido Pestaña 3: Auditoría */}
      {tabActiva === 'auditoria' && (
        <div className="bg-[#13111C] border border-[#2D2845] rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Registros de Auditoría</h2>
              <p className="text-xs text-gray-400">Historial reciente de transacciones y eventos de cumplimiento.</p>
            </div>
            <button
              onClick={obtenerLogsAuditoria}
              className="px-3 py-1.5 bg-[#0B0A0F] border border-[#2D2845] hover:border-purple-500/40 text-purple-400 text-xs rounded-lg transition-colors"
            >
              Actualizar Registros
            </button>
          </div>

          {loadingLogs && (
            <p className="text-xs text-gray-400 text-center py-8">Cargando registros de auditoría...</p>
          )}

          {errorLogs && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs mb-4">
              {errorLogs}
            </div>
          )}

          {!loadingLogs && !errorLogs && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0A0F] text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#2D2845]">
                  <tr>
                    <th className="py-3 px-4">ID Log</th>
                    <th className="py-3 px-4">Acción / Descripción</th>
                    <th className="py-3 px-4">Usuario ID</th>
                    <th className="py-3 px-4">Fecha y Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D2845]/50 text-gray-300">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id_log || log.id} className="hover:bg-[#0B0A0F]/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-purple-400">#{log.id_log || log.id}</td>
                        <td className="py-3 px-4">{log.accion || log.descripcion || 'Sin descripción'}</td>
                        <td className="py-3 px-4">{log.id_usuario || 'N/A'}</td>
                        <td className="py-3 px-4 font-mono text-gray-400">
                          {new Date(log.fecha_transaccion || log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-400">
                        No hay registros de auditoría almacenados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VistaAdministracion;