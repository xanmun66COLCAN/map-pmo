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

export const createProyecto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, descripcion, fechaInicio, fechaFin, kpis } = req.body;

    // Validamos que al menos venga el nombre del proyecto
    if (!nombre) {
      res.status(400).json({ success: false, message: 'El nombre del proyecto es obligatorio.' });
      return;
    }

    // Creamos el proyecto en la base de datos usando Prisma
    const nuevoProyecto = await prisma.proyecto.create({
      data: {
        nombre,
        descripcion,
        fecha_inicio: fechaInicio ? new Date(fechaInicio) : new Date(),
        fecha_fin: fechaFin ? new Date(fechaFin) : new Date(),
        
        // Si vienen KPIs en la petición, los creamos en la misma transacción
        kpis: kpis && kpis.length > 0 ? {
          create: kpis.map((kpi: any) => ({
            nombre_kpi: kpi.nombre, 
            meta_valor: kpi.valorObjetivo, 
            // 🔄 Agregamos la unidad de medida obligatoria. Si no viene en el JSON, ponemos un valor por defecto.
            unidad_medida: kpi.unidadMedida || 'Porcentaje' 
          }))
        } : undefined
      },
      include: {
        kpis: true
      }
    });

    res.status(201).json({
      success: true,
      data: nuevoProyecto
    });
  } catch (error) {
    console.error('❌ Error al crear el proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear el proyecto.'
    });
  }
};