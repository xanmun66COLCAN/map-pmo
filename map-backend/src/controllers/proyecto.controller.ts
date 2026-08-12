import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export interface AuthRequest extends Request {
  usuario?: any;
}

const prisma = new PrismaClient();

// GET: Dashboard
export const getProyectosDashboard = async (_req: Request, res: Response) => {
  try {
    const [totalProyectos, proyectosPorEstado, agregadoPresupuesto, ultimosProyectos] = await Promise.all([
      prisma.proyecto.count(),
      prisma.proyecto.groupBy({
        by: ['estado'],
        _count: { estado: true },
      }),
      prisma.proyecto.aggregate({
        _sum: { presupuesto: true, costo_real: true },
        _avg: { porcentaje_avance: true },
      }),
      prisma.proyecto.findMany({
        take: 5,
        orderBy: { fecha_inicio: 'desc' },
      }),
    ]);

    const estadoConteo: { [key: string]: number } = {};
    proyectosPorEstado.forEach((curr) => {
      if (curr.estado) {
        estadoConteo[curr.estado] = curr._count.estado;
      }
    });

    const totalPresupuesto = Number(agregadoPresupuesto._sum?.presupuesto || 0);
    const totalCostoReal = Number(agregadoPresupuesto._sum?.costo_real || 0);

    res.json({
      success: true,
      data: {
        resumen: {
          totalProyectos,
          promedioAvanceGeneral: Number((agregadoPresupuesto._avg?.porcentaje_avance || 0).toFixed(2)),
        },
        finanzas: {
          totalPresupuesto,
          totalCostoReal,
          variacionPresupuestaria: totalPresupuesto - totalCostoReal,
        },
        distribucionPorEstado: estadoConteo,
        proyectosRecientes: ultimosProyectos,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al calcular el dashboard.', error: error.message });
  }
};

// GET ALL
export const getProyectos = async (_req: Request, res: Response) => {
  try {
    const proyectos = await prisma.proyecto.findMany({
      orderBy: { fecha_inicio: 'desc' },
    });
    res.status(200).json({ success: true, total: proyectos.length, data: proyectos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al obtener proyectos.', error: error.message });
  }
};

// GET BY ID
export const getProyectoById = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);
  try {
    const proyecto = await prisma.proyecto.findUnique({ where: { id } });
    if (!proyecto) {
      res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
      return;
    }
    res.status(200).json({ success: true, data: proyecto });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// CREATE
export const crearProyecto = async (req: AuthRequest, res: Response) => {
  try {
    const { codigo, nombre, descripcion, fecha_inicio, fecha_fin, presupuesto, departamento, lider_proyecto, estado } = req.body;

    if (!nombre || !codigo) {
      res.status(400).json({ success: false, message: 'Código y nombre son obligatorios.' });
      return;
    }

    const nuevoProyecto = await prisma.proyecto.create({
      data: {
        codigo,
        nombre,
        descripcion: descripcion || '',
        fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : new Date(),
        ...(fecha_fin && { fecha_fin: new Date(fecha_fin) }),
        presupuesto: presupuesto ? Number(presupuesto) : 0,
        departamento: departamento || '',
        lider_proyecto: lider_proyecto || '',
        estado: estado || 'Caso_de_Negocio',
      },
    });

    res.status(201).json({ success: true, data: nuevoProyecto });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// UPDATE
export const updateProyecto = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);
  try {
    const proyectoActualizado = await prisma.proyecto.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json({ success: true, data: proyectoActualizado });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE
export const deleteProyecto = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);
  try {
    await prisma.proyecto.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Proyecto eliminado.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
