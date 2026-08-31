import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit3, Save, X, Code, Calendar, DollarSign, User, Briefcase, TrendingUp } from "lucide-react";
import api from "../api/axiosInstance.js";
import SeccionKpis from "../components/SeccionKpis.jsx";
import EvaluacionMulticriterio from "../components/EvaluacionMulticriterio.jsx"; // 👈 1. Importado aquí

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

    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario")) || {};
    const rolUsuario = String(usuarioLogueado.rol || usuarioLogueado.tipo_rol || "").toLowerCase().trim();
    const idRol = Number(usuarioLogueado.id_rol || usuarioLogueado.rol_id);

    const esAdminOLider = 
        idRol === 1 || 
        idRol === 2 || 
        rolUsuario.includes("admin") || 
        rolUsuario.includes("lider") || 
        rolUsuario.includes("líder");

    useEffect(() => {
        let active = true;
        const cargarProyecto = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/proyectos/${id}`);
                const responseData = response.data;
                const datosProyecto = responseData?.data || responseData;
                
                if (!active) return;
                setProyecto(datosProyecto);
                setFormData(datosProyecto);
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

        if (id) cargarProyecto();
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
            const response = await api.put(`/proyectos/${id}`, formData);
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

    const formatearFechaInput = (fechaISO) => {
        if (!fechaISO) return "";
        return fechaISO.split("T")[0];
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
                    <button onClick={() => navigate("/dashboard")} className="bg-[#A855F7] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#9333EA] transition-all shadow-lg">
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
                    <button onClick={() => navigate("/dashboard")} className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-2 transition-all font-semibold">
                        ← Volver al Dashboard
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <button onClick={() => setShowDebug(!showDebug)} className="bg-[#2D2845] hover:bg-[#3D375B] text-purple-300 text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md border border-[#A855F7]/30" title="Ver JSON recibido">
                            <Code size={14} /> {showDebug ? "Ocultar JSON" : "Ver JSON"}
                        </button>

                        {esAdminOLider ? (
                            isEditing ? (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setIsEditing(false); setFormData(proyecto); }} className="bg-[#2D2845] hover:bg-[#3D375B] text-gray-300 text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all">
                                        <X size={14} /> Cancelar
                                    </button>
                                    <button onClick={handleSave} disabled={saving} className="bg-[#22C55E] hover:bg-[#1eb355] text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#22C55E]/25">
                                        <Save size={14} /> {saving ? "Guardando..." : "Guardar Cambios"}
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="bg-[#A855F7] hover:bg-[#9333EA] text-white text-xs px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#A855F7]/30 border border-purple-400/30">
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
                                <option value="Idea">Idea</option>
                                <option value="Evaluacion">En Evaluación</option>
                                <option value="Caso_de_Negocio">Caso de Negocio</option>
                                <option value="Aprobado">Aprobado</option>
                                <option value="Rechazado">Rechazado</option>
                            </select>
                        ) : (
                            <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold border ${
                                proyecto.estado === "Aprobado" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30" :
                                proyecto.estado === "Evaluacion" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
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

                {/* Grid con Campos */}
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

                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1">Solicitante</span>
                        <span className="text-sm font-semibold text-white">
                            {typeof proyecto.solicitante === 'object' && proyecto.solicitante !== null 
                                ? (proyecto.solicitante.nombre || "No especificado") 
                                : (proyecto.solicitante || "No especificado")}
                        </span>
                    </div>

                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            <DollarSign size={12} /> Presupuesto
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

                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1">Costo Real</span>
                        {isEditing ? (
                            <input
                                type="number"
                                name="costo_real"
                                value={formData.costo_real || ""}
                                onChange={handleChange}
                                className="w-full bg-[#0B0A0F] border border-[#A855F7] text-xs text-white rounded px-2 py-1.5 mt-1 focus:outline-none"
                            />
                        ) : (
                            <span className="text-sm font-semibold text-gray-200">
                                ${Number(proyecto.costo_real || 0).toLocaleString()}
                            </span>
                        )}
                    </div>

                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            <TrendingUp size={12} /> % Avance
                        </span>
                        {isEditing ? (
                            <input
                                type="number"
                                min="0"
                                max="100"
                                name="porcentaje_avance"
                                value={formData.porcentaje_avance || 0}
                                onChange={handleChange}
                                className="w-full bg-[#0B0A0F] border border-[#A855F7] text-xs text-white rounded px-2 py-1.5 mt-1 focus:outline-none"
                            />
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div className="bg-[#22C55E] h-full" style={{ width: `${proyecto.porcentaje_avance || 0}%` }}></div>
                                </div>
                                <span className="text-xs font-bold text-white">{proyecto.porcentaje_avance || 0}%</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            <Calendar size={12} /> Fecha de Inicio
                        </span>
                        {isEditing ? (
                            <input
                                type="date"
                                name="fecha_inicio"
                                value={formatearFechaInput(formData.fecha_inicio)}
                                onChange={handleChange}
                                className="w-full bg-[#0B0A0F] border border-[#A855F7] text-xs text-white rounded px-2 py-1.5 mt-1 focus:outline-none"
                            />
                        ) : (
                            <span className="text-sm font-semibold text-white">
                                {proyecto.fecha_inicio ? new Date(proyecto.fecha_inicio).toLocaleDateString() : "No definida"}
                            </span>
                        )}
                    </div>

                    <div className="bg-[#13111C] border border-[#2D2845] p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            <Calendar size={12} /> Fecha de Finalización
                        </span>
                        {isEditing ? (
                            <input
                                type="date"
                                name="fecha_fin"
                                value={formatearFechaInput(formData.fecha_fin)}
                                onChange={handleChange}
                                className="w-full bg-[#0B0A0F] border border-[#A855F7] text-xs text-white rounded px-2 py-1.5 mt-1 focus:outline-none"
                            />
                        ) : (
                            <span className="text-sm font-semibold text-white">
                                {proyecto.fecha_fin ? new Date(proyecto.fecha_fin).toLocaleDateString() : "No definida"}
                            </span>
                        )}
                    </div>
                </div>

                {/* ⚖️ SECCIÓN DE CALIFICACIÓN MULTICRITERIO */}
                <div className="mb-6">
                    <EvaluacionMulticriterio 
                        proyecto={proyecto} 
                        onActualizado={(proyectoActualizado) => {
                            setProyecto(proyectoActualizado);
                            setFormData(proyectoActualizado);
                        }} 
                    />
                </div>

                {/* 📊 SECCIÓN DE KPIs / INDICADORES CLAVE */}
                <SeccionKpis proyectoId={id} />
            </div>
        </div>
    );
};

export default DetalleProyecto;