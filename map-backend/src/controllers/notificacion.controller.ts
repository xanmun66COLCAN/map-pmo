import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/usuarios/:idUsuario/notificaciones
export const obtenerNotificacionesUsuario = async (req: Request, res: Response) => {
  try {
    const idUsuario = Number(req.params.idUsuario);
    const notificaciones = await prisma.notificacion.findMany({
      where: { idUsuario },
      orderBy: { creadoEn: 'desc' },
      take: 20,
    });
    return res.json(notificaciones);
  } catch (error) {
    return res.status(500).json({ error: 'Error al cargar notificaciones' });
  }
};

// PUT /api/notificaciones/:id/leer
export const marcarNotificacionLeida = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const actualizada = await prisma.notificacion.update({
      where: { id },
      data: { leida: true },
    });
    return res.json(actualizada);
  } catch (error) {
    return res.status(500).json({ error: 'Error al marcar notificación como leída' });
  }
};