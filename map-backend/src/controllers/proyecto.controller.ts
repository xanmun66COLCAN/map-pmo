import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export interface AuthRequest extends Request {
  usuario?: any;
}

const prisma = new PrismaClient();

// Función auxiliar para calcular el avance temporal estimado (0% a 100%)
const calcularAvanceAutomatico = (fechaInicio: Date | null, fechaFin: Date | null, estadoActual: string): number => {
  if (estadoActual === 'Completado') return 100;
  if (estadoActual === 'Cancelado') return 0; // 👈 Quitamos 'Caso_de_Negocio' para que calcule por fechas si ya empezaron

  if (!fechaInicio || !fechaFin) return 0;

  const hoy = new Date().getTime();
  const inicio = new Date(fechaInicio).getTime();
  const fin = new Date(fechaFin).getTime();

  if (fin <= inicio) return hoy >= fin ? 100 : 0;
  if (hoy < inicio) return 0;
  if (hoy >= fin) return 100;

  const totalDias = fin - inicio;
  const diasTranscurridos = hoy - inicio;

  const porcentaje = (diasTranscurridos / totalDias) * 100;
  return Math.min(Math.max(Math.round(porcentaje), 0), 100);
};

// GET: Dashboard
export const getProyectosDashboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalProyectos, proyectosPorEstado, agregadoPresupuesto, todosLosProyectos, ultimosProyectos] = await Promise.all([
      prisma.proyecto.count(),
      prisma.proyecto.groupBy({
        by: ['estado'],
        _count: { estado: true },
      }),
      prisma.proyecto.aggregate({
        _sum: { presupuesto: true, costo_real: true },
      }),
      prisma.proyecto.findMany({ select: { fecha_inicio: true, fecha_fin: true, estado: true, presupuesto: true, costo_real: true } }),
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
    const variacionPresupuestaria = totalPresupuesto - totalCostoReal;
    const tieneDesviacionNegativaGlobal = totalCostoReal > totalPresupuesto;

    // Promedio de avance general calculado dinámicamente
    let sumaAvances = 0;
    if (todosLosProyectos.length > 0) {
      todosLosProyectos.forEach(p => {
        sumaAvances += calcularAvanceAutomatico(p.fecha_inicio, p.fecha_fin, p.estado);
      });
    }
    const promedioAvanceGeneral = todosLosProyectos.length > 0 ? Number((sumaAvances / todosLosProyectos.length).toFixed(2)) : 0;

    res.json({
      success: true,
      data: {
        resumen: {
          totalProyectos,
          promedioAvanceGeneral,
        },
        finanzas: {
          totalPresupuesto,
          totalCostoReal,
          variacionPresupuestaria,
          alertaDesviacionNegativa: tieneDesviacionNegativaGlobal,
          mensajeDesviacion: tieneDesviacionNegativaGlobal 
            ? `⚠️ Alerta: Sobrecosto detectado por valor de $${Math.abs(variacionPresupuestaria).toLocaleString()}` 
            : 'Presupuesto dentro de los límites esperados',
        },
        distribucionPorEstado: estadoConteo,
        proyectosRecientes: ultimosProyectos.map((p: any) => {
          const pres = Number(p.presupuesto || 0);
          const real = Number(p.costo_real || 0);
          const desviacionProyecto = pres - real;
          return {
            ...p,
            porcentaje_avance: calcularAvanceAutomatico(p.fecha_inicio, p.fecha_fin, p.estado),
            alerta_desviacion: real > pres,
            variacion_presupuesto: desviacionProyecto,
            solicitante: {
              id: p.id_usuario || null,
              nombre: p.lider_proyecto || 'Sin Asignar',
              correo: '',
              departamento: p.departamento || 'General',
            },
          };
        }),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al calcular el dashboard.', error: error.message });
  }
};

// GET ALL
export const getProyectos = async (req: Request, res: Response): Promise<void> => {
  try {
    const proyectos = await prisma.proyecto.findMany();
    
    let evaluaciones: any[] = [];
    try {
      evaluaciones = await prisma.$queryRaw`SELECT * FROM evaluacion_multicriterio` as any[];
    } catch (e) {
      evaluaciones = [];
    }

    const resultado = proyectos.map((p: any) => {
      const evalMC = evaluaciones.find((e: any) => String(e.proyecto_id) === String(p.id));
      const presupuestoNum = Number(p.presupuesto || 0);
      const costoRealNum = Number(p.costo_real || 0);
      const tieneDesviacion = costoRealNum > presupuestoNum;
      
      return {
        ...p,
        porcentaje_avance: calcularAvanceAutomatico(p.fecha_inicio, p.fecha_fin, p.estado),
        puntaje_global: evalMC ? evalMC.puntaje_global : (p.puntaje_global ?? null),
        // Estandarización de nombres para coincidir con el Frontend y el Detail
        alerta_desviacion_negativa: tieneDesviacion,
        diferencia_presupuesto: presupuestoNum - costoRealNum,
        mensaje_desviacion: tieneDesviacion 
          ? `⚠️ Alerta: El costo real ($${costoRealNum.toLocaleString()}) supera el presupuesto planeado ($${presupuestoNum.toLocaleString()}).` 
          : 'Presupuesto saludable'
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

    const presupuestoNum = Number(proyecto.presupuesto || 0);
    const costoRealNum = Number(proyecto.costo_real || 0);
    const tieneDesviacion = costoRealNum > presupuestoNum;

    const proyectoFormateado = {
      ...proyecto,
      porcentaje_avance: calcularAvanceAutomatico(proyecto.fecha_inicio, proyecto.fecha_fin, proyecto.estado),
      alerta_desviacion_negativa: tieneDesviacion,
      diferencia_presupuesto: presupuestoNum - costoRealNum,
      mensaje_desviacion: tieneDesviacion 
        ? `⚠️ Alerta: El costo real ($${costoRealNum.toLocaleString()}) supera el presupuesto planeado ($${presupuestoNum.toLocaleString()}).` 
        : 'Presupuesto saludable',
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
  const idUsuarioAccion = req.usuario?.id 
    ? Number(req.usuario.id) 
    : (req.usuario?.userId ? Number(req.usuario.userId) : (req.usuario?.sub ? Number(req.usuario.sub) : null));

  try {
    const { codigo, nombre, descripcion, fecha_inicio, fecha_fin, presupuesto, departamento, lider_proyecto, estado } = req.body;

    if (!nombre || !codigo) {
      res.status(400).json({ success: false, message: 'Código y nombre son obligatorios.' });
      return;
    }

    const estadoInicial = estado || 'Caso_de_Negocio';
    const fechaInicioParsed = fecha_inicio ? new Date(fecha_inicio) : new Date();
    const fechaFinParsed = fecha_fin ? new Date(fecha_fin) : null;
    
    // Cálculo automático inicial del avance basado en fechas y estado
    const avanceInicial = calcularAvanceAutomatico(fechaInicioParsed, fechaFinParsed, estadoInicial);

    const dataProyecto: any = {
      codigo,
      nombre,
      descripcion: descripcion || '',
      fecha_inicio: fechaInicioParsed,
      presupuesto: presupuesto !== undefined ? Number(presupuesto) : 0,
      departamento: departamento || '',
      lider_proyecto: lider_proyecto || '',
      estado: estadoInicial,
      porcentaje_avance: avanceInicial,
    };

    if (fechaFinParsed) {
      dataProyecto.fecha_fin = fechaFinParsed;
    }

    const nuevoProyecto = await prisma.$transaction(async (tx) => {
      const proyecto = await tx.proyecto.create({
        data: dataProyecto,
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
      data: {
        ...nuevoProyecto,
        porcentaje_avance: avanceInicial
      },
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
      data: {
        ...proyectoActualizado,
        porcentaje_avance: calcularAvanceAutomatico(proyectoActualizado.fecha_inicio, proyectoActualizado.fecha_fin, proyectoActualizado.estado)
      },
    });
  } catch (error: any) {
    console.error('❌ Error al actualizar calificación multicriterio:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar la evaluación.', error: error.message });
  }
};

// UPDATE
export const updateProyecto = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  
  const idUsuarioAccion = req.usuario?.id 
    ? Number(req.usuario.id) 
    : (req.usuario?.userId ? Number(req.usuario.userId) : (req.usuario?.sub ? Number(req.usuario.sub) : null));

  try {
    const { 
      id: _id, 
      codigo: _codigo, 
      creado_en: _creado_en, 
      actualizado_en: _actualizado_en, 
      estado: _estado, 
      porcentaje_avance: _porcentaje_avance, 
      solicitante, 
      fecha_inicio, 
      fecha_fin, 
      presupuesto, 
      costo_real, 
      puntaje_global, 
      // 👇 Filtramos también los campos calculados que vienen del cliente para que Prisma no falle
      alerta_desviacion_negativa,
      diferencia_presupuesto,
      mensaje_desviacion,
      ...rest 
    } = req.body;

    const dataToUpdate: any = { ...rest };

    if (puntaje_global !== undefined && puntaje_global !== '') {
      dataToUpdate.puntaje_global = Number(puntaje_global);
    }

    if (fecha_inicio && String(fecha_inicio).trim() !== '') {
      dataToUpdate.fecha_inicio = new Date(fecha_inicio);
    }
    if (fecha_fin && String(fecha_fin).trim() !== '') {
      dataToUpdate.fecha_fin = new Date(fecha_fin);
    }

    if (presupuesto !== undefined && presupuesto !== '') {
      dataToUpdate.presupuesto = Number(presupuesto);
    }
    if (costo_real !== undefined && costo_real !== '') {
      dataToUpdate.costo_real = Number(costo_real);
    } 

    const proyectoActualizado = await prisma.$transaction(async (tx) => {
      const proyectoAnterior = await tx.proyecto.findUnique({
        where: { id },
        select: { project_manager: true, fecha_inicio: true, fecha_fin: true, estado: true }
      } as any) as any;

      const fInicio = dataToUpdate.fecha_inicio || proyectoAnterior?.fecha_inicio;
      const fFin = dataToUpdate.fecha_fin || proyectoAnterior?.fecha_fin;
      dataToUpdate.porcentaje_avance = calcularAvanceAutomatico(fInicio, fFin, proyectoAnterior?.estado || 'En_Proceso');

      const proyecto = await tx.proyecto.update({
        where: { id },
        data: dataToUpdate,
      });

      if (
        dataToUpdate.project_manager !== undefined && 
        dataToUpdate.project_manager !== proyectoAnterior?.project_manager
      ) {
        await tx.logs_auditoria.create({
          data: {
            id_usuario_accion: idUsuarioAccion,
            id_proyecto: id,
            campo_modificado: 'project_manager',
            valor_anterior: proyectoAnterior?.project_manager || 'Sin Asignar',
            valor_nuevo: dataToUpdate.project_manager || 'Sin Asignar',
            fecha_transaccion: new Date(),
          },
        });
      }

      return proyecto;
    });

    const presActual = Number(proyectoActualizado.presupuesto || 0);
    const costoActual = Number(proyectoActualizado.costo_real || 0);

    res.status(200).json({ 
      success: true, 
      data: {
        ...proyectoActualizado,
        porcentaje_avance: calcularAvanceAutomatico(proyectoActualizado.fecha_inicio, proyectoActualizado.fecha_fin, proyectoActualizado.estado),
        alerta_desviacion_negativa: costoActual > presActual,
        diferencia_presupuesto: presActual - costoActual
      } 
    });
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
    const nuevoAvance = calcularAvanceAutomatico(proyectoExistente.fecha_inicio, proyectoExistente.fecha_fin, nuevoEstado);

    const proyectoActualizado = await prisma.proyecto.update({
      where: { id },
      data: { 
        estado: nuevoEstado,
        porcentaje_avance: nuevoAvance 
      }
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

    const presActual = Number(proyectoActualizado.presupuesto || 0);
    const costoActual = Number(proyectoActualizado.costo_real || 0);

    res.status(200).json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: {
        ...proyectoActualizado,
        porcentaje_avance: nuevoAvance,
        alerta_desviacion_negativa: costoActual > presActual
      }
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

// OBTENER LOGS DE AUDITORÍA UNIFICADOS CON DATOS DEL PROYECTO
export const getLogsAuditoria = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await prisma.logs_auditoria.findMany({
      include: {
        usuarios: { select: { correo: true } },
      },
      orderBy: { fecha_transaccion: 'desc' }
    });

    const proyectos = await prisma.proyecto.findMany({
      select: { id: true, codigo: true, nombre: true }
    });

    const logsConProyecto = logs.map(log => {
      const proyectoEncontrado = proyectos.find(p => p.id === log.id_proyecto);
      return {
        ...log,
        proyecto: proyectoEncontrado ? { codigo: proyectoEncontrado.codigo, nombre: proyectoEncontrado.nombre } : null,
        proyecto_info: proyectoEncontrado ? `${proyectoEncontrado.codigo} - ${proyectoEncontrado.nombre}` : 'GLOBAL'
      };
    });

    res.json({
      success: true,
      data: logsConProyecto
    });
  } catch (error) {
    console.error("Error al obtener auditoría:", error);
    res.status(500).json({ success: false, message: 'Error al obtener los registros de auditoría.' });
  }
};

// AGREGAR REGISTRO DE BITÁCORA Y AUDITORÍA
export const agregarSeguimiento = async (req: AuthRequest, res: Response): Promise<void> => {
  const idProyecto = String(req.params.id);
  const idUsuarioAccion = req.usuario?.id 
    ? Number(req.usuario.id) 
    : (req.usuario?.userId ? Number(req.usuario.userId) : (req.usuario?.sub ? Number(req.usuario.sub) : null));

  try {
    const { fecha_seguimiento, detalle_seguimiento, proximo_seguimiento, temas_pendientes, responsable_pendientes } = req.body;

    const resultado = await prisma.$transaction(async (tx) => {
      const nuevoSeguimiento = await (tx as any).bitacora_seguimiento.create({
        data: {
          proyecto_id: idProyecto,
          fecha_seguimiento: fecha_seguimiento ? new Date(fecha_seguimiento) : new Date(),
          detalle_seguimiento,
          proximo_seguimiento,
          temas_pendientes,
          responsable_pendientes,
          creado_por: idUsuarioAccion
        }
      });

      await tx.logs_auditoria.create({
        data: {
          id_usuario_accion: idUsuarioAccion,
          id_proyecto: idProyecto,
          campo_modificado: 'nuevo_seguimiento_bitacora',
          valor_anterior: 'Sin registro previo',
          valor_nuevo: `Seguimiento añadido: ${(detalle_seguimiento || '').substring(0, 100)}`,
          fecha_transaccion: new Date()
        }
      });

      return nuevoSeguimiento;
    });

    res.status(201).json({ success: true, data: resultado });
  } catch (error: any) {
    console.error('❌ Error al agregar seguimiento:', error);
    res.status(500).json({ success: false, message: 'Error al agregar seguimiento', error: error.message });
  }
};

// OBTENER LA BITÁCORA DE UN PROYECTO
export const getBitacoraProyecto = async (req: Request, res: Response): Promise<void> => {
  const idProyecto = String(req.params.id);
  try {
    const bitacora = await (prisma as any).bitacora_seguimiento.findMany({
      where: { proyecto_id: idProyecto },
      orderBy: { fecha_seguimiento: 'desc' }
    });
    res.status(200).json({ success: true, data: bitacora });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al obtener bitácora', error: error.message });
  }
};