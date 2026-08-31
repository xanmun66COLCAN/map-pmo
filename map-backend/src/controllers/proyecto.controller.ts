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
// En getProyectos (o la función que lista los proyectos para las tarjetas):
export const getProyectos = async (req: Request, res: Response): Promise<void> => {
  try {
    const proyectos = await prisma.proyecto.findMany();
    
    // Traemos directamente todas las evaluaciones multicriterio por SQL
    let evaluaciones: any[] = [];
    try {
      evaluaciones = await prisma.$queryRaw`SELECT * FROM evaluacion_multicriterio` as any[];
    } catch (e) {
      evaluaciones = [];
    }

    const resultado = proyectos.map((p: any) => {
      // Buscamos la evaluación que corresponda al id del proyecto
      const evalMC = evaluaciones.find((e: any) => String(e.proyecto_id) === String(p.id));
      
      return {
        ...p,
        // Forzamos la lectura del puntaje global y aseguramos que no sea undefined
        puntaje_global: evalMC ? evalMC.puntaje_global : (p.puntaje_global ?? null),
      };
    });

    res.json(resultado);
  } catch (error: any) {
    console.error('Error en getProyectos:', error);
    res.status(500).json({ message: 'Error al obtener proyectos', error: error.message });
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
  // Captura robusta del ID de usuario compatible con .id, .userId o .sub
  const idUsuarioAccion = req.usuario?.id 
    ? Number(req.usuario.id) 
    : (req.usuario?.userId ? Number(req.usuario.userId) : (req.usuario?.sub ? Number(req.usuario.sub) : null));

  try {
    const { codigo, nombre, descripcion, fecha_inicio, fecha_fin, presupuesto, departamento, lider_proyecto, estado } = req.body;

    if (!nombre || !codigo) {
      res.status(400).json({ success: false, message: 'Código y nombre son obligatorios.' });
      return;
    }

    const nuevoProyecto = await prisma.$transaction(async (tx) => {
      const proyecto = await tx.proyecto.create({
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

      await tx.kpi.createMany({
        data: [
          {
            proyecto_id: proyecto.id,
            nombre_kpi: 'Ejecución de Presupuesto',
            frecuencia: 'Mensual',
            descripcion: 'Control del presupuesto asignado frente al ejecutado en la iniciativa.',
            meta_valor: 100,
            valor_actual: 0
          },
          {
            proyecto_id: proyecto.id,
            nombre_kpi: 'Cumplimiento de Entregables',
            frecuencia: 'Mensual',
            descripcion: 'Porcentaje de productos o fases completadas según el cronograma.',
            meta_valor: 100,
            valor_actual: 0
          }
        ]
      });

      await tx.logs_auditoria.create({
        data: {
          id_usuario_accion: idUsuarioAccion,
          id_proyecto: proyecto.id,
          campo_modificado: 'creacion_proyecto',
          valor_anterior: 'Nueva iniciativa',
          valor_nuevo: `Creación de iniciativa: ${nombre} (${codigo})`,
          fecha_transaccion: new Date()
        }
      });

      return proyecto;
    });

    res.status(201).json({ 
      success: true, 
      message: '¡Iniciativa creada exitosamente!',
      data: nuevoProyecto,
      usuarioRegistrador: req.usuario?.correo || 'Usuario del Sistema'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ACTUALIZAR CALIFICACIÓN MULTICRITERIO
export const actualizarEvaluacionMulticriterio = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  
  const idUsuarioAccion = req.usuario?.id 
    ? Number(req.usuario.id) 
    : (req.usuario?.userId ? Number(req.usuario.userId) : (req.usuario?.sub ? Number(req.usuario.sub) : null));

  try {
    const { beneficio, costo, riesgo, alineacion } = req.body;

    if (
      beneficio === undefined || 
      costo === undefined || 
      riesgo === undefined || 
      alineacion === undefined
    ) {
      res.status(400).json({ success: false, message: 'Todos los criterios son obligatorios.' });
      return;
    }

    const scoreCalculado = 
      (Number(beneficio) * 0.30) + 
      (Number(costo) * 0.25) + 
      (Number(riesgo) * 0.20) + 
      (Number(alineacion) * 0.25);

    const puntaje_global = Number(scoreCalculado.toFixed(2));

    const proyectoActualizado = await prisma.$transaction(async (tx) => {
      const proyectoAnterior = await tx.proyecto.findUnique({
        where: { id },
        select: { puntaje_global: true }
      });

      const proyecto = await tx.proyecto.update({
        where: { id },
        data: {
          beneficio: Number(beneficio),
          costo: Number(costo),
          riesgo: Number(riesgo),
          alineacion: Number(alineacion),
          puntaje_global,
        },
      });

      await tx.logs_auditoria.create({
        data: {
          id_usuario_accion: idUsuarioAccion,
          id_proyecto: id,
          campo_modificado: 'calificacion_multicriterio',
          valor_anterior: `Evaluación previa: ${proyectoAnterior?.puntaje_global ?? 'Ninguna'}`,
          valor_nuevo: `Puntaje: ${puntaje_global}/10 (B:${beneficio}, C:${costo}, R:${riesgo}, A:${alineacion})`,
          fecha_transaccion: new Date(),
        },
      });

      return proyecto;
    });

    res.status(200).json({
      success: true,
      message: 'Calificación multicriterio actualizada exitosamente',
      data: proyectoActualizado,
    });
  } catch (error: any) {
    console.error('❌ Error al actualizar calificación multicriterio:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar la evaluación.', error: error.message });
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
  const id = String(req.params.id);
  const nuevoEstado = req.body.nuevoEstado || req.body.estado;

  const idUsuarioAccion = req.usuario?.id 
    ? Number(req.usuario.id) 
    : (req.usuario?.userId ? Number(req.usuario.userId) : (req.usuario?.sub ? Number(req.usuario.sub) : null));

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

    try {
      await prisma.logs_auditoria.create({
        data: {
          id_usuario_accion: idUsuarioAccion,
          id_proyecto: id,
          campo_modificado: 'estado',
          valor_anterior: estadoAnterior,
          valor_nuevo: nuevoEstado,
          fecha_transaccion: new Date()
        }
      });
    } catch (auditError) {
      console.error('❌ ERROR AL GUARDAR AUDITORÍA:', auditError);
    }

    res.status(200).json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: proyectoActualizado
    });
  } catch (error: any) {
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
export const getLogsAuditoria = async (_req: AuthRequest, res: Response): Promise<void> => {
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