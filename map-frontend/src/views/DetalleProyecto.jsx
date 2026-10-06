import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit3, Save, X, Code, Calendar, DollarSign, User, Briefcase, TrendingUp, BookOpen, Plus, FileText } from "lucide-react";
import api from "../api/axiosInstance.js";
import SeccionKpis from "../components/SeccionKpis.jsx";
import EvaluacionMulticriterio from "../components/EvaluacionMulticriterio.jsx";
import ReporteEjecutivoModal from "../components/ReporteEjecutivoModal.jsx";

const DetalleProyecto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [proyecto, setProyecto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    const [comiteSeleccionado, setComiteSeleccionado] = useState(null);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [nuevaFechaHora, setNuevaFechaHora] = useState('');

    // Estado controlado para el Reporte Ejecutivo (Inicia en false)
    const [mostrarModalReporte, setMostrarModalReporte] = useState(false);

    const [comites, setComites] = useState([]);
    const [mostrarModalComite, setMostrarModalComite] = useState(false);
    const [nuevoComiteState, setNuevoComiteState] = useState({
        titulo: '',
        tipo: 'Seguimiento',
        fechaHora: '',
        descripcion: ''
    });

    // Estados para la Bitácora de Seguimiento Ejecutivo
    const [bitacora, setBitacora] = useState([]);
    const [mostrarFormBitacora, setMostrarFormBitacora] = useState(false);
    const [nuevoSeguimiento, setNuevoSeguimiento] = useState({
        fecha_seguimiento: new Date().toISOString().split("T")[0],
        detalle_seguimiento: "",
        proximo_seguimiento: "",
        temas_pendientes: "",
        responsable_pendientes: ""
    });
    const [guardandoBitacora, setGuardandoBitacora] = useState(false);

    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario")) || {};
    const rolUsuario = String(usuarioLogueado.rol || usuarioLogueado.tipo_rol || "").toLowerCase().trim();
    const idRol = Number(usuarioLogueado.id_rol || usuarioLogueado.rol_id);
    const idUsuarioReal = usuarioLogueado.id || usuarioLogueado.id_usuario || usuarioLogueado.usuario_id;

    const handleActualizarComite = async (e) => {
        e.preventDefault();
        if (!comiteSeleccionado) return;

        try {
            const res = await api.put(`/comites/${comiteSeleccionado.id}`, {
                fechaHora: nuevaFechaHora,
                motivo: 'Reprogramación por causa mayor',
                id_usuario: idUsuarioReal, // 👈 Enviado para registro en la auditoría
                usuario_id: idUsuarioReal
            });

            if (res.data.success) {
                // Actualizamos la lista localmente reemplazando el comité modificado
                setComites(prev => prev.map(c => c.id === comiteSeleccionado.id ? res.data.data : c));
                setMostrarModalEditar(false);
                setComiteSeleccionado(null);
                alert('¡Comité reprogramado con éxito! Se han actualizado las notificaciones.');
            }
        } catch (err) {
            console.error('Error al actualizar comité:', err);
            alert('Hubo un error al intentar reprogramar el comité.');
        }
    };

    const esAdminOLider = 
        idRol === 1 || 
        idRol === 2 || 
        rolUsuario.includes("admin") || 
        rolUsuario.includes("lider") || 
        rolUsuario.includes("líder");

    // Estados para el formulario de nuevo KPI
    const [mostrarFormKpi, setMostrarFormKpi] = useState(false);
    const [nuevoKpi, setNuevoKpi] = useState({
        nombre: '',
        valor_objetivo: '',
        valor_actual: '',
        unidad: '%',
        descripcion: ''
    });
    const [guardandoKpi, setGuardandoKpi] = useState(false);
    
    // Funciones para KPIs
    const handleEditarKpi = async (kpiId, kpiActualizado) => {
        try {
            await api.put(`/proyectos/${id}/kpis/${kpiId}`, {
                ...kpiActualizado,
                id_usuario: idUsuarioReal
            });
            alert('✅ ¡KPI actualizado exitosamente y registrado en la bitácora de auditoría!');
            window.location.reload();
        } catch (err) {
            const mensaje = err.response?.data?.message || err.response?.data?.error || err.message;
            alert(`Error al actualizar el KPI: ${mensaje}`);
        }
    };

    const handleBorrarKpi = async (kpiId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este KPI? Esta acción quedará registrada en el log de auditoría.')) {
            return;
        }

        try {
            await api.delete(`/proyectos/${id}/kpis/${kpiId}`);
            alert('🗑️ ¡KPI eliminado correctamente!');
            window.location.reload();
        } catch (err) {
            const mensaje = err.response?.data?.message || err.response?.data?.error || err.message;
            alert(`Error al eliminar el KPI: ${mensaje}`);
        }
    };

    const handleCrearKpi = async (e) => {
        e.preventDefault();
        if (!nuevoKpi.nombre || !nuevoKpi.valor_objetivo) {
            alert('El nombre del KPI y el valor objetivo son obligatorios.');
            return;
        }

        try {
            setGuardandoKpi(true);
            await api.post(`/proyectos/${id}/kpis`, {
                nombre_kpi: nuevoKpi.nombre,
                meta_valor: Number(nuevoKpi.valor_objetivo),
                valor_actual: Number(nuevoKpi.valor_actual || 0),
                unidad_medida: nuevoKpi.unidad || '%',
                descripcion: nuevoKpi.descripcion || '',
                id_usuario: idUsuarioReal
            });

            alert('✅ ¡KPI creado exitosamente!');
            setMostrarFormKpi(false);
            setNuevoKpi({ nombre: '', valor_objetivo: '', valor_actual: '', unidad: '%' });
            
            window.location.reload(); 
        } catch (err) {
            const mensaje = err.response?.data?.message || err.response?.data?.error || err.message;
            alert(`Error al crear el KPI: ${mensaje}`);
        } finally {
            setGuardandoKpi(false);
        }
    };

    // Cargar Proyecto, Bitácora y Comités
    useEffect(() => {
        let active = true;
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const [resProyecto, resBitacora, resComites] = await Promise.all([
                    api.get(`/proyectos/${id}`),
                    api.get(`/proyectos/${id}/bitacora`).catch(() => ({ data: { data: [] } })),
                    api.get(`/comites?idProyecto=${id}`).catch(() => ({ data: { data: [] } }))
                ]);

                if (!active) return;
                
                const datosProyecto = resProyecto.data?.data || resProyecto.data;
                const datosBitacora = resBitacora.data?.data || resBitacora.data || [];
                
                // Fallback resiliente para recuperar comités:
                // 1. Revisa resComites
                // 2. Revisa datosProyecto.comites (minúscula)
                // 3. Revisa datosProyecto.Comite (mayúscula original)
                const datosComites = 
                    (resComites.data?.data || resComites.data || []).length > 0
                        ? (resComites.data?.data || resComites.data)
                        : (datosProyecto.comites || datosProyecto.Comite || []);

                setProyecto(datosProyecto);
                setFormData(datosProyecto);
                setBitacora(datosBitacora);
                setComites(Array.isArray(datosComites) ? datosComites : []);
                setError("");
            } catch (err) {
                if (!active) return;
                const mensaje = err.response?.data?.message || err.response?.data?.error || err.message;
                setError(mensaje || "No se pudo obtener la información de la iniciativa.");
            } finally {
                if (active) setLoading(false);
            }
        };

        if (id) cargarDatos();
        return () => { active = false; };
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { entregables_completados, ...datosAEnviar } = formData;

            const response = await api.put(`/proyectos/${id}`, {
                ...datosAEnviar,
                id_usuario: idUsuarioReal
            });
            const responseData = response.data;
            const datosActualizados = responseData?.data || responseData;
            
            setProyecto(datosActualizados);
            setFormData(datosActualizados);
            setIsEditing(false);
            alert("¡Iniciativa actualizada con éxito en PostgreSQL!");
        } catch (err) {
            const mensaje = err.response?.data?.message || err.response?.data?.error || err.message;
            alert(`Error al guardar: ${mensaje || "No se pudo actualizar la iniciativa."}`);
        } finally {
            setSaving(false);
        }
    };

    const handleGuardarSeguimiento = async (e) => {
        e.preventDefault();
        if (!nuevoSeguimiento.detalle_seguimiento) {
            alert("El detalle del seguimiento es obligatorio.");
            return;
        }

        try {
            setGuardandoBitacora(true);
            const response = await api.post(`/proyectos/${id}/bitacora`, {
                ...nuevoSeguimiento,
                id_usuario: idUsuarioReal
            });
            const creado = response.data?.data || response.data;

            setBitacora([creado, ...bitacora]);
            setMostrarFormBitacora(false);
            setNuevoSeguimiento({
                fecha_seguimiento: new Date().toISOString().split("T")[0],
                detalle_seguimiento: "",
                proximo_seguimiento: "",
                temas_pendientes: "",
                responsable_pendientes: ""
            });
            alert("Seguimiento registrado exitosamente en la bitácora.");
        } catch (err) {
            const mensaje = err.response?.data?.message || err.response?.data?.error || err.message;
            alert(`Error al registrar seguimiento: ${mensaje}`);
        } finally {
            setGuardandoBitacora(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0A0F] text-white flex flex-col justify-center items-center">
                <div className="w-8 h-8 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-[#94A3B8]">Cargando detalle del proyecto desde PostgreSQL...</p>
            </div>
        );
    }

    if (error || !proyecto) {
        return (
            <div className="min-h-screen bg-[#0B0A0F] text-white p-6 flex flex-col items-center justify-center">
                <div className="bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171] p-6 rounded-xl text-center max-w-md shadow-xl">
                    <p className="mb-4 text-sm font-semibold">⚠️ {error || "Iniciativa no encontrada."}</p>
                    <button onClick={() => navigate("/dashboard")} className="bg-[#A855F7] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#9333EA] transition-all shadow-lg cursor-pointer">
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0A0F] text-white p-6 flex flex-col items-center relative pb-24">
            <div className="w-full max-w-4xl">
                {/* Barra Superior */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[#2D2845]">
                    <button onClick={() => navigate("/dashboard")} className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-2 transition-all font-semibold cursor-pointer">
                        ← Volver al Dashboard
                    </button>

                    {/* Cabecera con Título, ID y Botones de Acción Global */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4 w-full">
                        <div>
                            <h1 className="text-xl font-bold text-slate-100">{proyecto?.nombre || 'Detalle del Proyecto'}</h1>
                            <p className="text-xs text-slate-400 font-mono">ID: {proyecto?.id}</p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">

                            {/* Botón Agendar Comité */}
                            <button
                                type="button"
                                onClick={() => setMostrarModalComite(true)}
                                className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
                            >
                                <Calendar size={14} /> Agendar Comité
                            </button>

                            {/* Botón Reporte Ejecutivo (Base) */}
                            <button 
                                onClick={() => setMostrarModalReporte(true)} 
                                className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
                            >
                                <FileText size={14} /> Reporte Ejecutivo
                            </button>

                            <button onClick={() => setShowDebug(!showDebug)} className="bg-[#2D2845] hover:bg-[#3D375B] text-purple-300 text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md border border-[#A855F7]/30 cursor-pointer" title="Ver JSON recibido">
                                <Code size={14} /> {showDebug ? "Ocultar JSON" : "Ver JSON"}
                            </button>

                            {esAdminOLider ? (
                                isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { setIsEditing(false); setFormData(proyecto); }} className="bg-[#2D2845] hover:bg-[#3D375B] text-gray-300 text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer">
                                            <X size={14} /> Cancelar
                                        </button>
                                        <button onClick={handleSave} disabled={saving} className="bg-[#22C55E] hover:bg-[#1eb355] text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#22C55E]/25 cursor-pointer">
                                            <Save size={14} /> {saving ? "Guardando..." : "Guardar Cambios"}
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="bg-[#A855F7] hover:bg-[#9333EA] text-white text-xs px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#A855F7]/30 border border-purple-400/30 cursor-pointer">
                                        <Edit3 size={15} /> Actualizar Información
                                    </button>
                                )
                            ) : (
                                <span className="text-[11px] text-gray-400 bg-[#13111C] px-3 py-1.5 rounded-lg border border-[#2D2845]">
                                    👁️ Modo Solo Lectura
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal para Reprogramar Comité */}
                {mostrarModalEditar && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!comiteSeleccionado) return;

                                try {
                                    const res = await api.put(`/comites/${comiteSeleccionado.id}`, {
                                        fechaHora: nuevaFechaHora,
                                        motivo: 'Reprogramación por causa mayor',
                                        id_usuario: idUsuarioReal, // 👈 Identidad enviada a auditoría
                                        usuario_id: idUsuarioReal
                                    }, {
                                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                    });

                                    if (res.data.success) {
                                        const comiteActualizado = res.data.data || res.data;
                                        setComites(prev => prev.map(c => c.id === comiteSeleccionado.id ? comiteActualizado : c));
                                        setMostrarModalEditar(false);
                                        setComiteSeleccionado(null);
                                        setNuevaFechaHora('');
                                        alert('¡Comité reprogramado con éxito! Se han actualizado las notificaciones por causa mayor.');
                                    }
                                } catch (err) {
                                    console.error('Error al actualizar comité:', err);
                                    alert('Hubo un error al intentar reprogramar el comité.');
                                }
                            }}
                            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-slate-100 space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <h3 className="text-lg font-semibold text-amber-400">⚠️ Reprogramar Comité</h3>
                                <button
                                    type="button"
                                    onClick={() => setMostrarModalEditar(false)}
                                    className="text-slate-400 hover:text-slate-200 text-sm"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Selector desplegable de comités futuros */}
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                                    Seleccionar Comité a Reprogramar
                                </label>
                                <select
                                    value={comiteSeleccionado?.id || ''}
                                    onChange={(e) => {
                                        const idSeleccionado = Number(e.target.value);
                                        const comiteEncontrado = comites.find(c => c.id === idSeleccionado);
                                        if (comiteEncontrado) {
                                            setComiteSeleccionado(comiteEncontrado);
                                            const fechaFormateada = comiteEncontrado.fechaHora 
                                                ? new Date(comiteEncontrado.fechaHora).toISOString().slice(0, 16) 
                                                : '';
                                            setNuevaFechaHora(fechaFormateada);
                                        }
                                    }}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                                >
                                    <option value="" disabled>Selecciona un comité...</option>
                                    {(() => {
                                        const ahora = new Date();
                                        const comitesFuturos = comites 
                                            ? comites.filter(c => new Date(c.fechaHora) >= ahora)
                                            : [];

                                        if (comitesFuturos.length === 0) {
                                            return <option value="" disabled>No hay comités futuros disponibles</option>;
                                        }

                                        return comitesFuturos.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.titulo} ({new Date(c.fechaHora).toLocaleDateString('es-ES', { dateStyle: 'medium' })})
                                            </option>
                                        ));
                                    })()}
                                </select>
                            </div>

                            {/* Información del comité seleccionado */}
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Comité activo:</p>
                                <p className="text-sm font-semibold text-slate-200 bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                                    {comiteSeleccionado ? comiteSeleccionado.titulo : 'Ninguno seleccionado'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                                    Nueva Fecha y Hora (Causa Mayor)
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={nuevaFechaHora}
                                    onChange={(e) => setNuevaFechaHora(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModalEditar(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!comiteSeleccionado}
                                    className="px-5 py-2 rounded-lg text-sm font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-950/50 disabled:opacity-50"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Modal Oscuro para Agendar Comité */}
                {mostrarModalComite && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const res = await api.post(`/comites/proyecto/${id}`,{
                                        ...nuevoComiteState,
                                        idProyecto: proyecto?.id,
                                        id_usuario: idUsuarioReal, // 👈 Identidad enviada a auditoría
                                        usuario_id: idUsuarioReal
                                    }, {
                                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                    });

                                    if (res.data.success) {
                                        const comiteCreado = res.data.data || res.data;
                                        setComites(prev => [...prev, comiteCreado]);
                                        setMostrarModalComite(false);
                                        setNuevoComiteState({ titulo: '', tipo: 'Seguimiento', fechaHora: '', descripcion: '' });
                                        alert('¡Comité programado con éxito! Las notificaciones automáticas han sido enviadas a los recursos.');
                                    }
                                } catch (err) {
                                    console.error('Error al guardar comité:', err);
                                    alert('Hubo un error al intentar agendar el comité. Inténtalo de nuevo.');
                                }
                            }}
                            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-slate-100 space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <h3 className="text-lg font-semibold text-emerald-400">📅 Agendar Nuevo Comité</h3>
                                <button
                                    type="button"
                                    onClick={() => setMostrarModalComite(false)}
                                    className="text-slate-400 hover:text-slate-200 text-sm"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Título del Comité</label>
                                <input
                                    type="text"
                                    required
                                    value={nuevoComiteState.titulo}
                                    onChange={(e) => setNuevoComiteState({ ...nuevoComiteState, titulo: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                                    placeholder="Ej: Comité técnico quincenal"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Tipo</label>
                                    <input
                                        type="text"
                                        value={nuevoComiteState.tipo}
                                        onChange={(e) => setNuevoComiteState({ ...nuevoComiteState, tipo: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="Seguimiento"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Fecha y Hora</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={nuevoComiteState.fechaHora}
                                        onChange={(e) => setNuevoComiteState({ ...nuevoComiteState, fechaHora: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Descripción</label>
                                <textarea
                                    rows={2}
                                    value={nuevoComiteState.descripcion}
                                    onChange={(e) => setNuevoComiteState({ ...nuevoComiteState, descripcion: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 resize-none transition-colors"
                                    placeholder="Puntos clave a tratar en la reunión..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModalComite(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-lg text-sm font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-950/50"
                                >
                                    Guardar y Notificar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Renglón exclusivo para el Próximo Comité Programado */}
                {(() => {
                    const ahora = new Date();
                    const comitesFuturos = comites
                        ? [...comites]
                            .filter(c => new Date(c.fechaHora) >= ahora)
                            .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
                        : [];

                    const proximoComite = comitesFuturos.length > 0 ? comitesFuturos[0] : null;

                    return (
                        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="p-2.5 rounded-lg bg-purple-950/50 border border-purple-800/40 text-purple-400">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-semibold tracking-wider uppercase text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/30">
                                            Próximo Comité
                                        </span>
                                        <h3 className="text-sm font-bold text-slate-100">
                                            {proximoComite ? proximoComite.titulo : 'Sin comités programados'}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {proximoComite 
                                            ? `Tipo: ${proximoComite.tipo} • 📅 ${new Date(proximoComite.fechaHora).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}`
                                            : 'Utiliza el botón superior de "Agendar Comité" para programar el siguiente seguimiento.'}
                                    </p>
                                </div>
                            </div>

                            {proximoComite && (
                                <button
                                    onClick={() => {
                                        const idComite = proximoComite.id || proximoComite.idComite;
                                        
                                        if (!idComite) {
                                            alert('Error: El comité seleccionado no tiene un ID válido.');
                                            return;
                                        }

                                        setComiteSeleccionado(proximoComite);
                                        const fechaFormateada = proximoComite.fechaHora ? new Date(proximoComite.fechaHora).toISOString().slice(0, 16) : '';
                                        setNuevaFechaHora(fechaFormateada);
                                        setMostrarModalEditar(true);
                                    }}
                                    className="w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-medium text-amber-400 bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                                >
                                    ⚠️ Reprogramar este comité
                                </button>
                            )}
                        </div>
                    );
                })()}

                {/* Panel Depuración JSON */}
                {showDebug && (
                    <div className="bg-[#13111C] border border-[#A855F7]/40 rounded-xl p-4 mb-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#2D2845]">
                            <h4 className="text-xs font-bold text-[#A855F7] uppercase tracking-wider flex items-center gap-2">
                                <Code size={14} /> Inspector de Estado (JSON)
                            </h4>
                        </div>
                        <pre className="text-xs text-green-400 bg-[#0B0A0F] p-4 rounded-lg overflow-x-auto max-h-80 border border-[#2D2845]">
                            {JSON.stringify(proyecto, null, 2)}
                        </pre>
                    </div>
                )}

                {/* Tarjeta Principal */}
                <div className="bg-[#13111C] border border-[#2D2845] rounded-xl p-6 shadow-xl mb-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 pb-4 border-b border-[#2D2845]">
                        <div>
                            <span className="text-[10px] text-[#A855F7] font-bold uppercase tracking-wider bg-[#A855F7]/10 px-2.5 py-1 rounded-md border border-[#A855F7]/20">
                                Código: {proyecto.codigo || "N/A"}
                            </span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre || ""}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0A0F] border border-[#A855F7] text-white font-black text-xl rounded-lg px-3 py-2 mt-3 focus:outline-none"
                                />
                            ) : (
                                <h1 className="text-2xl font-black text-white mt-3">{proyecto.nombre}</h1>
                            )}
                        </div>

                        {/* Estado */}
                        {isEditing ? (
                            <select
                                name="estado"
                                value={formData.estado || ""}
                                onChange={handleChange}
                                className="bg-[#0B0A0F] border border-[#A855F7] text-white text-xs font-bold rounded-lg px-3 py-2 focus:outline-none"
                            >
                                <option value="Caso_de_Negocio">Caso de Negocio</option>
                                <option value="Aprobado">Aprobado</option>
                                <option value="En_Proceso">En Proceso</option>
                                <option value="En_Pausa">En Pausa</option>
                                <option value="Completado">Completado</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        ) : (
                            <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold border ${
                                proyecto.estado === "Aprobado" || proyecto.estado === "Completado" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30" :
                                proyecto.estado === "En_Proceso" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                                proyecto.estado === "Caso_de_Negocio" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                                "bg-gray-500/10 text-gray-400 border-gray-500/30"
                            }`}>
                                {proyecto.estado}
                            </span>
                        )}
                    </div>

                    {/* Descripción */}
                    <div>
                        <h3 className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider mb-2">Descripción General</h3>
                        {isEditing ? (
                            <textarea
                                name="descripcion"
                                rows={4}
                                value={formData.descripcion || ""}
                                onChange={handleChange}
                                className="w-full bg-[#0B0A0F] border border-[#A855F7] text-sm text-gray-200 rounded-lg p-4 focus:outline-none leading-relaxed"
                            />
                        ) : (
                            <p className="text-sm text-gray-300 leading-relaxed bg-[#0B0A0F]/50 p-4 rounded-lg border border-[#2D2845]/60">
                                {proyecto.descripcion || "Sin descripción registrada."}
                            </p>
                        )}
                    </div>
                </div>

                {/* Alerta de Presupuesto */}
                {(() => {
                    const presupuestoNum = Number(proyecto?.presupuesto || 0);
                    const costoRealNum = Number(proyecto?.costo_real || 0);
                    const tieneSobrecosto = costoRealNum > presupuestoNum;

                    if (!tieneSobrecosto) return null;

                    return (
                        <div className="w-full bg-red-950/30 border border-red-500/40 p-4 rounded-xl mb-6 flex items-start gap-3 shadow-lg">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Alerta de Desviación Negativa en Presupuesto</h4>
                                <p className="text-xs text-red-200 mt-1">
                                    El costo real ejecutado (<strong className="text-white">${costoRealNum.toLocaleString()}</strong>) supera al presupuesto planeado (<strong className="text-white">${presupuestoNum.toLocaleString()}</strong>) por una diferencia de <strong className="text-red-400">${Math.abs(presupuestoNum - costoRealNum).toLocaleString()}</strong>.
                                </p>
                            </div>
                        </div>
                    );
                })()}

                {/* 📖 BITÁCORA DE SEGUIMIENTO EJECUTIVO */}
                <div className="bg-[#13111C] border border-[#2D2845] rounded-xl p-6 shadow-xl mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[#2D2845]">
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <BookOpen size={16} className="text-[#A855F7]" /> Bitácora de Seguimiento Ejecutivo
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">Historial estructurado para el reporte informativo de la iniciativa.</p>
                        </div>
                        {esAdminOLider && (
                            <button
                                onClick={() => setMostrarFormBitacora(!mostrarFormBitacora)}
                                className="bg-[#A855F7]/20 hover:bg-[#A855F7]/30 text-[#A855F7] border border-[#A855F7]/40 text-xs px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <Plus size={14} /> {mostrarFormBitacora ? "Cerrar Formulario" : "Agregar Seguimiento"}
                            </button>
                        )}
                    </div>

                    {/* Formulario Nuevo Seguimiento */}
                    {mostrarFormBitacora && (
                        <form onSubmit={handleGuardarSeguimiento} className="bg-[#0B0A0F] border border-[#2D2845] p-4 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] text-gray-400 uppercase font-bold mb-1">Fecha de Seguimiento</label>
                                <input
                                    type="date"
                                    value={nuevoSeguimiento.fecha_seguimiento}
                                    onChange={(e) => setNuevoSeguimiento({ ...nuevoSeguimiento, fecha_seguimiento: e.target.value })}
                                    className="w-full bg-[#13111C] border border-[#2D2845] text-xs text-white rounded-lg p-2.5 focus:border-[#A855F7] focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] text-gray-400 uppercase font-bold mb-1">Responsable de Pendientes</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Nombre del responsable"
                                    value={nuevoSeguimiento.responsable_pendientes}
                                    onChange={(e) => setNuevoSeguimiento({ ...nuevoSeguimiento, responsable_pendientes: e.target.value })}
                                    className="w-full bg-[#13111C] border border-[#2D2845] text-xs text-white rounded-lg p-2.5 focus:border-[#A855F7] focus:outline-none"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-[11px] text-gray-400 uppercase font-bold mb-1">Detalle del Seguimiento *</label>
                                <textarea
                                    rows={3}
                                    placeholder="Resumen ejecutivo del avance en este periodo..."
                                    value={nuevoSeguimiento.detalle_seguimiento}
                                    onChange={(e) => setNuevoSeguimiento({ ...nuevoSeguimiento, detalle_seguimiento: e.target.value })}
                                    className="w-full bg-[#13111C] border border-[#2D2845] text-xs text-white rounded-lg p-2.5 focus:border-[#A855F7] focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] text-gray-400 uppercase font-bold mb-1">Temas Pendientes</label>
                                <textarea
                                    rows={2}
                                    placeholder="Bloqueos, tareas abiertas o riesgos..."
                                    value={nuevoSeguimiento.temas_pendientes}
                                    onChange={(e) => setNuevoSeguimiento({ ...nuevoSeguimiento, temas_pendientes: e.target.value })}
                                    className="w-full bg-[#13111C] border border-[#2D2845] text-xs text-white rounded-lg p-2.5 focus:border-[#A855F7] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] text-gray-400 uppercase font-bold mb-1">Próximos Seguimientos</label>
                                <textarea
                                    rows={2}
                                    placeholder="Metas o fechas para el siguiente control..."
                                    value={nuevoSeguimiento.proximo_seguimiento}
                                    onChange={(e) => setNuevoSeguimiento({ ...nuevoSeguimiento, proximo_seguimiento: e.target.value })}
                                    className="w-full bg-[#13111C] border border-[#2D2845] text-xs text-white rounded-lg p-2.5 focus:border-[#A855F7] focus:outline-none"
                                />
                            </div>

                            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setMostrarFormBitacora(false)}
                                    className="bg-[#2D2845] hover:bg-[#3D375B] text-gray-300 text-xs px-4 py-2 rounded-lg font-bold transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardandoBitacora}
                                    className="bg-[#A855F7] hover:bg-[#9333EA] text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-md shadow-[#A855F7]/30 cursor-pointer"
                                >
                                    {guardandoBitacora ? "Guardando..." : "Guardar Registro"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Lista de Registros de Bitácora */}
                    <div className="space-y-4">
                        {bitacora.length > 0 ? (
                            bitacora.map((item, index) => (
                                <div key={item.id || index} className="bg-[#0B0A0F] border border-[#2D2845] p-4 rounded-xl border-l-4 border-l-[#A855F7]">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-2 border-b border-[#2D2845]/50">
                                        <span className="text-xs font-bold text-[#A855F7] flex items-center gap-1.5">
                                            <Calendar size={13} /> {new Date(item.fecha_seguimiento).toLocaleDateString()}
                                        </span>
                                        <span className="text-[11px] bg-[#13111C] text-gray-300 px-2.5 py-1 rounded-md border border-[#2D2845]">
                                            👤 Resp: <strong className="text-white">{item.responsable_pendientes || "No asignado"}</strong>
                                        </span>
                                    </div>

                                    <div className="mb-3">
                                        <h5 className="text-[11px] text-gray-400 uppercase font-bold mb-1">Detalle del Seguimiento</h5>
                                        <p className="text-xs text-gray-200 leading-relaxed bg-[#13111C]/50 p-3 rounded-lg border border-[#2D2845]/40">
                                            {item.detalle_seguimiento}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        {item.temas_pendientes && (
                                            <div className="bg-[#13111C]/40 p-2.5 rounded-lg border border-[#2D2845]/40">
                                                <span className="block font-bold text-amber-400 mb-0.5 text-[10px] uppercase">Temas Pendientes</span>
                                                <span className="text-gray-300">{item.temas_pendientes}</span>
                                            </div>
                                        )}
                                        {item.proximo_seguimiento && (
                                            <div className="bg-[#13111C]/40 p-2.5 rounded-lg border border-[#2D2845]/40">
                                                <span className="block font-bold text-[#22C55E] mb-0.5 text-[10px] uppercase">Próximos Seguimientos</span>
                                                <span className="text-gray-300">{item.proximo_seguimiento}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-500 text-center py-6 bg-[#0B0A0F] rounded-xl border border-[#2D2845]">
                                No hay seguimientos registrados en la bitácora todavía.
                            </p>
                        )}
                    </div>
                </div>

                {/* Grid con Campos y Métricas Clave */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            <User size={12} /> Líder del Proyecto
                        </span>
                        {isEditing ? (
                            <input
                                type="text"
                                name="lider_proyecto"
                                value={formData.lider_proyecto || ""}
                                onChange={handleChange}
                                className="w-full bg-[#0B0A0F] border border-[#A855F7] text-xs text-white rounded px-2 py-1.5 mt-1 focus:outline-none"
                            />
                        ) : (
                            <span className="text-sm font-semibold text-white">{proyecto.lider_proyecto || "No asignado"}</span>
                        )}
                    </div>

                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            <User size={12} /> Project Manager a cargo
                        </span>
                        {isEditing ? (
                            <input
                                type="text"
                                name="project_manager"
                                value={formData.project_manager || ""}
                                onChange={handleChange}
                                placeholder="Ej. Nombre del PM"
                                className="w-full bg-[#0B0A0F] border border-[#A855F7] text-xs text-white rounded px-2 py-1.5 mt-1 focus:outline-none"
                            />
                        ) : (
                            <span className="text-sm font-semibold text-purple-300">
                                {proyecto.project_manager || "Sin asignar"}
                            </span>
                        )}
                    </div>

                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            <Briefcase size={12} /> Departamento
                        </span>
                        {isEditing ? (
                            <select
                                name="departamento"
                                value={formData.departamento || ""}
                                onChange={handleChange}
                                className="w-full bg-[#0B0A0F] border border-[#A855F7] text-xs text-white rounded px-2 py-1.5 mt-1 focus:outline-none"
                            >
                                <option value="">Seleccione un departamento...</option>
                                <option value="TI">TI</option>
                                <option value="Atención al Cliente">Atención al Cliente</option>
                                <option value="RD">R&D</option>
                                <option value="Inteligencia de Negocios">Inteligencia de Negocios</option>
                                <option value="Finanzas">Finanzas</option>
                                <option value="Innovación y Desarrollo">Innovación y Desarrollo</option>
                                <option value="Desarrollo de Software">Desarrollo de Software</option>
                                <option value="Operaciones">Operaciones</option>
                                <option value="Comercial y Ventas">Comercial y Ventas</option>
                                <option value="Infraestructura y Redes">Infraestructura y Redes</option>
                                <option value="Gestión de Talento RRHH">Gestión de Talento RRHH</option>
                                <option value="PMO">PMO</option>
                                <option value="Seguridad de la Información">Seguridad de la Información</option>
                            </select>
                        ) : (
                            <span className="text-sm font-semibold text-white">{proyecto.departamento || "General"}</span>
                        )}
                    </div>

                    {/* Fecha de Inicio */}
                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            <Calendar size={12} /> Fecha de Inicio
                        </span>
                        {isEditing ? (
                            <input
                                type="date"
                                name="fecha_inicio"
                                value={formData.fecha_inicio ? formData.fecha_inicio.split("T")[0] : ""}
                                onChange={handleChange}
                                className="w-full bg-[#0B0A0F] border border-[#A855F7] text-xs text-white rounded px-2 py-1.5 mt-1 focus:outline-none"
                            />
                        ) : (
                            <span className="text-sm font-semibold text-white">
                                {proyecto.fecha_inicio ? new Date(proyecto.fecha_inicio).toLocaleDateString() : "No definida"}
                            </span>
                        )}
                    </div>

                    {/* Fecha de Fin Prevista */}
                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            <Calendar size={12} /> Fecha Fin Prevista
                        </span>
                        {isEditing ? (
                            <input
                                type="date"
                                name="fecha_fin"
                                value={formData.fecha_fin ? formData.fecha_fin.split("T")[0] : ""}
                                onChange={handleChange}
                                className="w-full bg-[#0B0A0F] border border-[#A855F7] text-xs text-white rounded px-2 py-1.5 mt-1 focus:outline-none"
                            />
                        ) : (
                            <span className="text-sm font-semibold text-white">
                                {proyecto.fecha_fin ? new Date(proyecto.fecha_fin).toLocaleDateString() : "No definida"}
                            </span>
                        )}
                    </div>

                    {/* Porcentaje de Avance (%) */}
                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            <TrendingUp size={12} /> Porcentaje de Avance (%)
                        </span>
                        {(() => {
                            const avanceCalculado = Number(proyecto.porcentaje_avance || 0); 
                            
                            return (
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 bg-[#0B0A0F] h-2 rounded-full overflow-hidden border border-[#2D2845]">
                                        <div 
                                            className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${Math.min(Math.max(avanceCalculado, 0), 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-bold text-purple-300">{Math.round(avanceCalculado)}%</span>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Presupuesto Planificado */}
                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            <DollarSign size={12} /> Presupuesto Planificado
                        </span>
                        {isEditing ? (
                            <input
                                type="number"
                                name="presupuesto"
                                value={formData.presupuesto || ""}
                                onChange={handleChange}
                                className="w-full bg-[#0B0A0F] border border-[#A855F7] text-xs text-white rounded px-2 py-1.5 mt-1 focus:outline-none"
                            />
                        ) : (
                            <span className="text-sm font-semibold text-green-400">
                                ${Number(proyecto.presupuesto || 0).toLocaleString()}
                            </span>
                        )}
                    </div>

                    {/* Costo Real Ejecutado */}
                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            <DollarSign size={12} /> Costo Real Ejecutado
                        </span>
                        {isEditing ? (
                            <input
                                type="number"
                                name="costo_real"
                                value={formData.costo_real || ""}
                                onChange={handleChange}
                                className="w-full bg-[#0B0A0F] border border-[#A855F7] text-xs text-white rounded px-2 py-1.5 mt-1 focus:outline-none"
                            />
                        ) : (
                            <span className="text-sm font-semibold text-amber-400">
                                ${Number(proyecto.costo_real || 0).toLocaleString()}
                            </span>
                        )}
                    </div>

                    {/* % de Ejecución Presupuestal */}
                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold flex items-center gap-1">
                                <TrendingUp size={12} /> % Ejecución Presupuestal
                            </span>
                        </div>
                        {(() => {
                            const p = Number(proyecto?.presupuesto || 0);
                            const c = Number(proyecto?.costo_real || 0);
                            const porcentajeEjecucion = p > 0 ? Math.min(Math.round((c / p) * 100), 100) : 0;
                            const superaPresupuesto = c > p;

                            return (
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-[#0B0A0F] h-2 rounded-full overflow-hidden border border-[#2D2845]">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${superaPresupuesto ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                            style={{ width: `${Math.min(porcentajeEjecucion, 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className={`text-sm font-bold ${superaPresupuesto ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {p > 0 ? Math.round((c / p) * 100) : 0}%
                                    </span>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* 📊 SECCIÓN DE KPIS CON BOTÓN DE CREACIÓN DIRECTA */}
                <div className="bg-[#13111C] border border-[#2D2845] rounded-xl p-6 shadow-xl mb-6">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#2D2845]">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">📊 Indicadores Clave (KPIs)</h3>
                        {esAdminOLider && (
                            <button
                                onClick={() => setMostrarFormKpi(!mostrarFormKpi)}
                                className="bg-[#A855F7]/20 hover:bg-[#A855F7]/30 text-[#A855F7] border border-[#A855F7]/40 text-xs px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <Plus size={14} /> {mostrarFormKpi ? 'Cancelar' : 'Nuevo KPI'}
                            </button>
                        )}
                    </div>

                    {mostrarFormKpi && (
                        <form onSubmit={handleCrearKpi} className="space-y-4 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl text-slate-100">
                            <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
                                <span>📊</span> Nuevo Indicador de Rendimiento (KPI)
                            </h3>

                            {/* Campo Nombre */}
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                                    Nombre del KPI <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={nuevoKpi.nombre}
                                    onChange={(e) => setNuevoKpi({ ...nuevoKpi, nombre: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    placeholder="Ej: Ejecución presupuestal"
                                    required
                                />
                            </div>

                            {/* Fila doble: Valor Objetivo y Valor Actual */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                                        Valor Objetivo (Meta) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={nuevoKpi.valor_objetivo}
                                        onChange={(e) => setNuevoKpi({ ...nuevoKpi, valor_objetivo: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                        placeholder="100"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                                        Valor Actual Inicial
                                    </label>
                                    <input
                                        type="number"
                                        value={nuevoKpi.valor_actual}
                                        onChange={(e) => setNuevoKpi({ ...nuevoKpi, valor_actual: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Campo Unidad de Medida */}
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                                    Unidad de Medida
                                </label>
                                <input
                                    type="text"
                                    value={nuevoKpi.unidad}
                                    onChange={(e) => setNuevoKpi({ ...nuevoKpi, unidad: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    placeholder="%, $, Días, Unidades"
                                />
                            </div>

                            {/* Campo de Descripción */}
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    value={nuevoKpi.descripcion}
                                    onChange={(e) => setNuevoKpi({ ...nuevoKpi, descripcion: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
                                    rows="3"
                                    placeholder="Explica brevemente para qué sirve este indicador y cómo se calcula..."
                                />
                            </div>

                            {/* Botones de acción estilizados */}
                            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setMostrarFormKpi(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardandoKpi}
                                    className="px-5 py-2 rounded-lg text-sm font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all disabled:opacity-50 shadow-lg shadow-emerald-950/50"
                                >
                                    {guardandoKpi ? 'Guardando...' : 'Crear KPI'}
                                </button>
                            </div>
                        </form>
                    )}

                    <SeccionKpis 
                        proyectoId={id} 
                        esAdminOLider={esAdminOLider}
                        onEditKpi={handleEditarKpi}
                        onDeleteKpi={handleBorrarKpi}
                    />
                </div>

                {/* Secciones Adicionales */}
                <div className="space-y-6">
                    <EvaluacionMulticriterio proyecto={proyecto} setProyecto={setProyecto} isEditing={isEditing} formData={formData} setFormData={setFormData} />
                </div>
            </div>

            {/* Modal de Reporte Ejecutivo Controlado */}
            {mostrarModalReporte && (
                <ReporteEjecutivoModal 
                    proyecto={proyecto} 
                    bitacora={bitacora} 
                    onClose={() => setMostrarModalReporte(false)} 
                />
            )}
        </div>
    );
};

export default DetalleProyecto;