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
    const { 
      id: _id, 
      codigo: _codigo, 
      creado_en: _creado_en, 
      actualizado_en: _actualizado_en, 
      solicitante, 
      fecha_inicio, 
      fecha_fin, 
      presupuesto, 
      porcentaje_avance, 
      costo_real, 
      ...rest 
    } = req.body;

    const dataToUpdate: any = { ...rest };

    if (fecha_inicio && fecha_inicio.trim() !== '') {
      dataToUpdate.fecha_inicio = new Date(fecha_inicio);
    }
    if (fecha_fin && fecha_fin.trim() !== '') {
      dataToUpdate.fecha_fin = new Date(fecha_fin);
    }

    if (presupuesto !== undefined && presupuesto !== '') {
      dataToUpdate.presupuesto = Number(presupuesto);
    }
    if (porcentaje_avance !== undefined && porcentaje_avance !== '') {
      dataToUpdate.porcentaje_avance = parseInt(porcentaje_avance, 10);
    }
    if (costo_real !== undefined && costo_real !== '') {
      dataToUpdate.costo_real = Number(costo_real);
    } 

    const proyectoActualizado = await prisma.proyecto.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json({ success: true, data: proyectoActualizado });
  } catch (error: any) {
    console.error('❌ Error detallado al actualizar proyecto en Prisma:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el proyecto.', error: error.message });
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
  console.log("🔥 RUTA ALCANZADA: /proyectos/:id/estado (o similar)");
  console.log("📦 Body recibido:", req.body);
  console.log("🆔 Params recibidos:", req.params);
  const id = String(req.params.id);
  const nuevoEstado = req.body.nuevoEstado || req.body.estado;

  console.log("🟢 [DEBUG] Intentando cambiar estado de iniciativa");
  console.log("🟢 ID Proyecto:", id);
  console.log("🟢 Nuevo estado recibido:", nuevoEstado);
  console.log("🟢 Usuario en request:", req.usuario);

  try {
    if (!nuevoEstado) {
      res.status(400).json({ success: false, message: 'El nuevo estado es obligatorio.' });
      return;
    }

    const proyectoExistente = await prisma.proyecto.findUnique({ where: { id } });
    if (!proyectoExistente) {
      res.status(404).json({ success: false, message: 'El proyecto no existe en la base de datos.' });
      return;
    }

    const estadoAnterior = proyectoExistente.estado;

    const proyectoActualizado = await prisma.proyecto.update({
      where: { id },
      data: { estado: nuevoEstado }
    });

    // 📝 Registrar el cambio usando exactamente las columnas que la tabla posee
    try {
      await prisma.logs_auditoria.create({
        data: {
          id_usuario_accion: req.usuario?.id || null,
          id_proyecto: id,
          campo_modificado: 'estado',
          valor_anterior: estadoAnterior, // Asegúrate de tener esta variable con el estado previo
          valor_nuevo: nuevoEstado,
          fecha_transaccion: new Date()
        }
      });
      console.log('✅ Cambio de estado registrado en auditoría correctamente');
    } catch (auditError) {
      console.error('❌ ERROR AL GUARDAR AUDITORÍA:', auditError);
    }

    res.status(200).json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: proyectoActualizado
    });
  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO EN actualizarestadoIniciativa:", error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: 'Error interno al actualizar estado', 
        error: error.message || error 
      });
    }
  }
};

// OBTENER LOGS DE AUDITORÍA UNIFICADOS
export const getLogsAuditoria = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await prisma.logs_auditoria.findMany({
      include: {
        usuarios: { select: { correo: true } }
      },
      orderBy: { fecha_transaccion: 'desc' }
    });

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error("Error al obtener auditoría:", error);
    res.status(500).json({ success: false, message: 'Error al obtener los registros de auditoría.' });
  }
};