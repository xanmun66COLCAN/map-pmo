import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProyectosDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    // Traemos todos los proyectos incluyendo sus KPIs y sus recursos asignados
    const proyectos = await prisma.proyecto.findMany({
      include: {
        kpis: true,
        asignaciones: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: proyectos
    });
  } catch (error) {
    console.error('❌ Error al obtener proyectos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener los proyectos.'
    });
  }
};