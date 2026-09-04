import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interfaz para tipar el cuerpo de la petición (Request Body)
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

        // 1. Crear el registro del comité
        const nuevoComite = await prisma.comite.create({
            data: {
                titulo,
                tipo,
                fechaHora: new Date(fechaHora),
                idProyecto,
                descripcion
            }
        });

        // 2. Generar la notificación asociada
        // Si usas un middleware de autenticación que inyecta el usuario, puedes acceder a req.user?.id
        const usuarioObjetivo = idUsuario || (req as any).user?.id || null;

        await prisma.notificacion.create({
            data: {
                idUsuario: usuarioObjetivo,
                titulo: `Nuevo Comité: ${titulo}`,
                mensaje: `Se ha agendado el comité "${titulo}" para la fecha ${new Date(fechaHora).toLocaleString()}.`,
                tipo: "comite",
                leida: false,
            },
            });

        return res.status(201).json({
            success: true,
            message: 'Comité agendado y notificación generada exitosamente.',
            data: nuevoComite
        });

    } catch (error) {
        console.error('Error al agendar comité:', error);
        return res.status(500).json({
            success: false,
            error: 'Ocurrió un error al procesar la solicitud.'
        });
    }
};