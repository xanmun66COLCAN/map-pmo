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
      costo_real,
      porcentaje_avance,
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
        costo_real: costo_real ? parseFloat(costo_real) : null,
        porcentaje_avance: porcentaje_avance ? parseFloat(porcentaje_avance) : 0,
        departamento,
        lider_proyecto,
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

// 🔍 GET: Obtener el detalle completo de un proyecto por ID (UUID)
export const getProyectoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Mantenemos el ID como string (UUID)

    const proyecto = await prisma.proyecto.findUnique({
      where: { id }, // 👈 Corregido: sin Number(id)
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