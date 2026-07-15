import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 📊 GET: Dashboard de proyectos
export const getProyectosDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const proyectos = await prisma.proyecto.findMany({
      include: {
        kpis: true,
        asignaciones: {
          include: {
            usuario: {
              select: {
                nombre: true,
                // 🚀 Cambiado de 'email: true' a 'correo: true' para que coincida con el schema.prisma
                correo: true 
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

  } catch (error: any) {
    console.error("🔥 ERROR REAL:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor al obtener los proyectos',
      error
    });
  }
};


// ➕ CREATE: Crear proyecto
export const createProyecto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, descripcion, fechaInicio, fechaFin, kpis } = req.body;

    // Validación básica
    if (!nombre) {
      res.status(400).json({
        success: false,
        message: 'El nombre del proyecto es obligatorio.'
      });
      return;
    }

    const nuevoProyecto = await prisma.proyecto.create({
      data: {
        nombre,
        descripcion,
        fecha_inicio: fechaInicio ? new Date(fechaInicio) : new Date(),
        fecha_fin: fechaFin ? new Date(fechaFin) : new Date(),

        kpis: kpis && kpis.length > 0
          ? {
              create: kpis.map((kpi: any) => ({
                nombre_kpi: kpi.nombre,
                meta_valor: kpi.valorObjetivo,
                unidad_medida: kpi.unidadMedida || 'Porcentaje'
              }))
            }
          : undefined
      },
      include: {
        kpis: true
      }
    });

    res.status(201).json({
      success: true,
      data: nuevoProyecto
    });

  } catch (error: any) {
    console.error("❌ Error al crear el proyecto:", error);

    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor al crear el proyecto',
      error
    });
  }
};