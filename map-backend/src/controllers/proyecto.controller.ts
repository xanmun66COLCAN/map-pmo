import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export interface AuthRequest extends Request {
  usuario?: any;
}

const prisma = new PrismaClient();

// GET: Dashboard
export const getProyectosDashboard = async (_req: Request, res: Response): Promise<void> => {
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
        proyectosRecientes: ultimosProyectos.map((p) => ({
          ...p,
          solicitante: {
            id: (p as any).id_usuario || null,
            nombre: p.lider_proyecto || 'Sin Asignar',
            correo: '',
            departamento: p.departamento || 'General',
          },
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al calcular el dashboard.', error: error.message });
  }
};

// GET ALL
export const getProyectos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const proyectos = await prisma.proyecto.findMany({
      orderBy: { fecha_inicio: 'desc' },
    });

    const proyectosFormateados = proyectos.map((p: any) => ({
      id: p.id,
      codigo: p.codigo,
      nombre: p.nombre,
      descripcion: p.descripcion,
      estado: p.estado,
      presupuesto: p.presupuesto,
      porcentaje_avance: p.porcentaje_avance,
      fecha_inicio: p.fecha_inicio,
      fecha_fin: p.fecha_fin,
      solicitante: {
        id: p.id_usuario || null,
        nombre: p.lider_proyecto || 'Sin Asignar',
        correo: '',
        departamento: p.departamento || 'General',
      },
    }));

    res.status(200).json({ success: true, total: proyectosFormateados.length, data: proyectosFormateados });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al obtener proyectos.', error: error.message });
  }
};

// GET BY ID
export const getProyectoById = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  try {
    const proyecto: any = await prisma.proyecto.findUnique({
      where: { id },
    });

    if (!proyecto) {
      res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
      return;
    }

    const proyectoFormateado = {
      ...proyecto,
      solicitante: {
        id: proyecto.id_usuario || null,
        nombre: proyecto.lider_proyecto || 'Sin Asignar',
        correo: '',
        departamento: proyecto.departamento || 'General',
      },
    };

    res.status(200).json({ success: true, data: proyectoFormateado });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// CREATE
export const crearProyecto = async (req: AuthRequest, res: Response): Promise<void> => {
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
        presupuesto: presupuesto !== undefined ? Number(presupuesto) : 0,
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
export const updateProyecto = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  try {
    const { fecha_inicio, fecha_fin, presupuesto, porcentaje_avance, costo_real, ...rest } = req.body;

    // Normalizar tipos numéricos y fechas si vienen en el body de actualización
    const dataToUpdate: any = { ...rest };
    if (fecha_inicio) dataToUpdate.fecha_inicio = new Date(fecha_inicio);
    if (fecha_fin) dataToUpdate.fecha_fin = new Date(fecha_fin);
    if (presupuesto !== undefined) dataToUpdate.presupuesto = Number(presupuesto);
    if (porcentaje_avance !== undefined) dataToUpdate.porcentaje_avance = Number(porcentaje_avance);
    if (costo_real !== undefined) dataToUpdate.costo_real = Number(costo_real);

    const proyectoActualizado = await prisma.proyecto.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json({ success: true, data: proyectoActualizado });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE
export const deleteProyecto = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  try {
    await prisma.proyecto.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Proyecto eliminado.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ACTUALIZAR ESTADO DE INICIATIVA / PROYECTO
export const actualizarEstadoIniciativa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { nuevoEstado } = req.body;
    const usuarioRol = (req.usuario?.rol || '').toLowerCase().trim();

    // Roles permitidos ampliados para incluir gestores o administradores
    const rolesPermitidos = ['admin', 'pmo_manager', 'director', 'administrador', 'lider_pmo', 'gestor'];
    
    if (!usuarioRol || !rolesPermitidos.includes(usuarioRol)) {
      res.status(403).json({ 
        success: false, 
        message: `Acceso denegado. El rol "${usuarioRol || 'desconocido'}" no cuenta con los privilegios necesarios.` 
      });
      return;
    }

    if (!nuevoEstado) {
      res.status(400).json({ success: false, message: 'El nuevo estado es obligatorio.' });
      return;
    }

    const proyectoActualizado = await prisma.proyecto.update({
      where: { id },
      data: { estado: nuevoEstado }
    });

    res.status(200).json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: proyectoActualizado
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};