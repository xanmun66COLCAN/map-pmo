import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AgendarComiteBody {
    titulo: string;
    tipo?: string;
    fechaHora: string;
    idProyecto?: string;
    descripcion?: string;
    idUsuario?: number;
}

export const agendarComite = async (req: Request<{}, {}, AgendarComiteBody>, res: Response): Promise<Response> => {
    try {
        const { titulo, tipo, fechaHora, idProyecto, descripcion, idUsuario } = req.body;

        if (!titulo || !fechaHora || !idProyecto) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos obligatorios (titulo, fechaHora, idProyecto).'
            });
        }

        // En agendarComite y actualizarComite, cambia esto:
        const usuarioAccionId = idUsuario || (req as any).usuario?.id ? Number((req as any).usuario.id) : null;   
        
        const resultado = await prisma.$transaction(async (tx) => {
            // 1. Crear el registro del comité
            const nuevoComite = await tx.comite.create({
                data: {
                    titulo,
                    tipo: tipo || 'Seguimiento',
                    fechaHora: new Date(fechaHora),
                    idProyecto,
                    descripcion
                }
            });

            // 2. Determinar a qué usuarios notificar
            let idsUsuarios: number[] = [];
            if (usuarioAccionId) idsUsuarios.push(Number(usuarioAccionId));

            const asignaciones = await tx.asignacionRecurso.findMany({
                where: { proyecto_id: idProyecto },
                select: { usuario_id: true }
            });

            const asignadosIds = asignaciones.map(a => a.usuario_id);
            idsUsuarios = [...new Set([...idsUsuarios, ...asignadosIds])];

            // 3. Generar las notificaciones masivas para la campana
            if (idsUsuarios.length > 0) {
                await tx.notificacion.createMany({
                    data: idsUsuarios.map(uid => ({
                        idUsuario: uid,
                        titulo: `📅 Nuevo Comité: ${titulo}`,
                        mensaje: `Se ha agendado un comité de tipo "${tipo || 'Seguimiento'}" para la fecha ${new Date(fechaHora).toLocaleString()}.`,
                        tipo: "comite",
                        leida: false
                    }))
                });
            }

            // 4. 🟢 Registrar en el Log de Auditoría usando `logs_auditoria`
            await tx.logs_auditoria.create({
                data: {
                    id_proyecto: idProyecto,
                    id_usuario_accion: usuarioAccionId ? Number(usuarioAccionId) : null,
                    campo_modificado: 'comite_creado',
                    valor_anterior: null,
                    valor_nuevo: `Comité: ${titulo} (${tipo || 'Seguimiento'})`,
                    fecha_transaccion: new Date()
                }
            });

            return nuevoComite;
        });

        return res.status(201).json({
            success: true,
            message: 'Comité agendado, notificado y auditado exitosamente.',
            data: resultado
        });

    } catch (error) {
        console.error('Error al agendar comité:', error);
        return res.status(500).json({
            success: false,
            error: 'Ocurrió un error al procesar la solicitud.'
        });
    }
};

export const actualizarComite = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { fechaHora, motivo, idUsuario } = req.body; // 👈 1. Añadimos idUsuario aquí
        
        // 2. Capturamos el ID priorizando el body o el token JWT (req.usuario)
        const usuarioAccionId = idUsuario || ((req as any).usuario?.id ? Number((req as any).usuario.id) : null);

        const resultado = await prisma.$transaction(async (tx) => {
            // Buscamos el comité actual para registrar el valor anterior
            const comiteAnterior = await tx.comite.findUnique({
                where: { id: Number(id) }
            });

            // 1. Actualizamos el comité
            const comiteActualizado = await tx.comite.update({
                where: { id: Number(id) },
                data: { 
                    fechaHora: new Date(fechaHora),
                }
            });

            // 2. 🟢 Registro detallado en el Log de Auditoría vinculado al usuario real
            await tx.logs_auditoria.create({
                data: {
                    id_proyecto: comiteActualizado.idProyecto,
                    id_usuario_accion: usuarioAccionId ? Number(usuarioAccionId) : null,
                    campo_modificado: 'fecha_hora_comite',
                    valor_anterior: comiteAnterior?.fechaHora ? new Date(comiteAnterior.fechaHora).toISOString() : null,
                    valor_nuevo: new Date(fechaHora).toISOString(),
                    fecha_transaccion: new Date()
                }
            });

            return comiteActualizado;
        });

        return res.status(200).json({
            success: true,
            message: 'Comité reprogramado y auditado con éxito',
            data: resultado
        });
    } catch (error) {
        console.error('Error al actualizar comité:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al actualizar el comité'
        });
    }
};

// 🟢 FUNCIÓN RECUPERADA Y EXPORTADA PARA LAS RUTAS
export const obtenerComitesPorProyecto = async (req: Request<{ idProyecto: string }>, res: Response): Promise<Response> => {
    try {
        const { idProyecto } = req.params;
        const comites = await prisma.comite.findMany({
            where: { idProyecto },
            orderBy: { fechaHora: 'desc' }
        });

        return res.status(200).json({
            success: true,
            data: comites
        });
    } catch (error) {
        console.error('Error al obtener comités:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al listar los comités.'
        });
    }
};