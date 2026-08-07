import { Request, Response } from 'express';
import { PrismaClient, EstadoProyecto } from '@prisma/client';

const prisma = new PrismaClient();

// 🟢 POST: Registrar un nuevo proyecto
export const crearProyecto = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      presupuesto,
      departamento,
      lider_proyecto,
      estado,
    } = req.body;

    // Validación de campos requeridos
    if (!nombre || !fecha_inicio) {
      res.status(400).json({
        success: false,
        message: "Campos requeridos faltantes. El 'nombre' y la 'fecha_inicio' son obligatorios.",
      });
      return;
    }

    // Operación de inserción con Prisma
    const nuevoProyecto = await prisma.proyecto.create({
      data: {
        nombre,
        descripcion,
        fecha_inicio: new Date(fecha_inicio),
        fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
        presupuesto: presupuesto ? parseFloat(presupuesto) : 0.00,
        estado: (estado as EstadoProyecto) || EstadoProyecto.Caso_de_Negocio,
      },
    });

    res.status(201).json({
      success: true,
      mensaje: "Proyecto creado exitosamente en MAP-PMO",
      data: nuevoProyecto,
    });
  } catch (error: any) {
    console.error("❌ Error en crearProyecto:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al procesar el registro del proyecto.",
      error: error.message,
    });
  }
};

// 🔍 GET: Obtener el detalle completo de un proyecto por ID
export const getProyectoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: Number(id) }, // Convertimos a Number si el schema usa Int autoincrementable
      include: {
        kpis: {
          include: {
            historial: true,
          },
        },
        asignaciones: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                correo: true,
              },
            },
          },
        },
      },
    });

    if (!proyecto) {
      res.status(404).json({
        success: false,
        message: 'La iniciativa solicitada no existe.',
      });
      return;
    }

    res.json({
      success: true,
      data: proyecto,
    });
  } catch (error: any) {
    console.error("❌ Error al obtener el detalle del proyecto:", error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al consultar la iniciativa.',
      error: error.message,
    });
  }
};

// 📊 GET: Obtener métricas y KPIs del Dashboard
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const agregadoPresupuesto = await prisma.proyecto.aggregate({
      _sum: {
        presupuesto: true,
      },
      _count: {
        id: true,
      },
    });

    const conteoPorEstado = await prisma.proyecto.groupBy({
      by: ['estado'],
      _count: {
        estado: true,
      },
    });

    const distribucionEstados = conteoPorEstado.reduce((acc, curr) => {
      const claveEstado = curr.estado || 'DESCONOCIDO';
      acc[claveEstado] = curr._count.estado;
      return acc;
    }, {} as Record<string, number>);

    const totalPresupuesto = Number(agregadoPresupuesto._sum?.presupuesto || 0);
    const totalProyectos = agregadoPresupuesto._count?.id || 0;

    res.json({
      success: true,
      data: {
        totalProyectos,
        totalPresupuesto,
        distribucionEstados,
      },
    });
  } catch (error: any) {
    console.error("❌ Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al consultar las estadísticas.',
      error: error.message,
    });
  }
};