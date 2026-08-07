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


// ➕ CREATE: Crear proyecto / iniciativa
export const createProyecto = async (req: Request, res: Response): Promise<void> => {
  try {
    // Soportamos tanto camelCase como snake_case desde el frontend
    const { 
      nombre, 
      descripcion, 
      fechaInicio, 
      fecha_inicio, 
      fechaFin, 
      fecha_fin, 
      presupuesto, 
      estado, 
      kpis 
    } = req.body;

    // 1. Validación básica
    if (!nombre) {
      res.status(400).json({
        success: false,
        message: 'El nombre del proyecto o iniciativa es obligatorio.'
      });
      return;
    }

    // Resolver las fechas correctamente
    const fechaInicioValida = fecha_inicio || fechaInicio;
    const fechaFinValida = fecha_fin || fechaFin;

    // 2. Creación en PostgreSQL vía Prisma
    const nuevoProyecto = await prisma.proyecto.create({
      data: {
        nombre,
        descripcion: descripcion || '',
        fecha_inicio: fechaInicioValida ? new Date(fechaInicioValida) : new Date(),
        fecha_fin: fechaFinValida ? new Date(fechaFinValida) : null,
        presupuesto: presupuesto ? Number(presupuesto) : 0,
        // Si no se especifica estado, entra por defecto como 'Idea' segun regla de PMO
        estado: estado || 'Idea',
        kpis: kpis && kpis.length > 0
          ? {
              create: kpis.map((kpi: any) => ({
                nombre_kpi: kpi.nombre || kpi.nombre_kpi,
                meta_valor: kpi.valorObjetivo || kpi.meta_valor || 0,
                unidad_medida: kpi.unidadMedida || kpi.unidad_medida || '%'
              }))
            }
          : undefined
      },
      include: {
        kpis: true,
        asignaciones: true
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

export const getProyectoById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const idNumero = Number(id);
    if (isNaN(idNumero)) {
      return res.status(400).json({ error: 'El ID del proyecto no es válido' });
    }

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: idNumero }
    });

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // ⬇️ Deshabilita el cache para asegurar siempre un status 200 con JSON fresco
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).json(proyecto);
  } catch (error: any) {
    console.error('❌ Error al obtener el proyecto por ID:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};