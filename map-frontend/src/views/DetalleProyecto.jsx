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
    
    // Estado controlado para el Reporte Ejecutivo (Inicia en false)
    const [mostrarModalReporte, setMostrarModalReporte] = useState(false);
    
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

    const esAdminOLider = 
        idRol === 1 || 
        idRol === 2 || 
        rolUsuario.includes("admin") || 
        rolUsuario.includes("lider") || 
        rolUsuario.includes("líder");

    // Cargar Proyecto y Bitácora
    useEffect(() => {
        let active = true;
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const [resProyecto, resBitacora] = await Promise.all([
                    api.get(`/proyectos/${id}`),
                    api.get(`/proyectos/${id}/bitacora`).catch(() => ({ data: { data: [] } }))
                ]);

                if (!active) return;
                
                const datosProyecto = resProyecto.data?.data || resProyecto.data;
                const datosBitacora = resBitacora.data?.data || resBitacora.data || [];

                setProyecto(datosProyecto);
                setFormData(datosProyecto);
                setBitacora(datosBitacora);
                setError("");
            } catch (err) {
                if (!active) return;
                const mensaje = err.response?.data?.message || err.response?.data?.error || err.message;
                setError(mensaje || "No se pudo obtener la información de la iniciativa.");
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.clear();
                    navigate("/");
                }
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

            const response = await api.put(`/proyectos/${id}`, datosAEnviar);
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
            const response = await api.post(`/proyectos/${id}/bitacora`, nuevoSeguimiento);
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

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
                        {/* Botón Reporte Ejecutivo */}
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
                            <input
                                type="text"
                                name="departamento"
                                value={formData.departamento || ""}
                                onChange={handleChange}
                                className="w-full bg-[#0B0A0F] border border-[#A855F7] text-xs text-white rounded px-2 py-1.5 mt-1 focus:outline-none"
                            />
                        ) : (
                            <span className="text-sm font-semibold text-white">{proyecto.departamento || "General"}</span>
                        )}
                    </div>

                    {/* Porcentaje de Avance */}
                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            <TrendingUp size={12} /> Porcentaje de Avance (%)
                        </span>
                        {isEditing ? (
                            <input
                                type="number"
                                min="0"
                                max="100"
                                name="porcentaje_avance"
                                value={formData.porcentaje_avance ?? 0}
                                onChange={handleChange}
                                className="w-full bg-[#0B0A0F] border border-[#A855F7] text-xs text-white rounded px-2 py-1.5 mt-1 focus:outline-none"
                            />
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-[#0B0A0F] h-2 rounded-full overflow-hidden border border-[#2D2845]">
                                    <div 
                                        className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                                        style={{ width: `${proyecto.porcentaje_avance || 0}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-bold text-purple-300">{proyecto.porcentaje_avance || 0}%</span>
                            </div>
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

                    {/* Fecha de Fin */}
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

                {/* Secciones Adicionales */}
                <div className="space-y-6">
                    <SeccionKpis proyectoId={id} esAdminOLider={esAdminOLider} />
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