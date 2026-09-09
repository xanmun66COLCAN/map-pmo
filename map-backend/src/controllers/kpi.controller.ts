import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export interface AuthRequest extends Request {
  usuario?: any;
}

const prisma = new PrismaClient();

// 🟢 GET: Obtener todos los KPIs de un proyecto específico
export const getKpisByProyecto = async (req: Request, res: Response): Promise<void> => {
  try {
    // Forzamos a string para evitar el error de tipado string | string[]
    const proyectoId = String(req.params.id);

    const kpis = await prisma.kpi.findMany({
      where: { proyecto_id: proyectoId },
      include: { historial: true },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: kpis });
  } catch (error: any) {
    console.error("❌ Error al obtener KPIs:", error);
    res.status(500).json({ success: false, message: 'Error interno al obtener los KPIs.', error: error.message });
  }
};

// 🟢 POST: Crear un nuevo KPI para una iniciativa (Con validación robusta)
export const crearKpi = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const proyectoId = req.params.id || req.body.proyecto_id;
    const { nombre_kpi, descripcion, meta_valor, valor_actual, unidad_medida, frecuencia } = req.body;
    
    const idUsuarioAccion = req.usuario?.id 
      ? Number(req.usuario.id) 
      : (req.usuario?.userId ? Number(req.usuario.userId) : (req.usuario?.sub ? Number(req.usuario.sub) : null));

    // Validación estricta para evitar que pasen nulos, vacíos o el texto "undefined"
    if (
      !proyectoId || 
      proyectoId === 'undefined' || 
      !nombre_kpi || 
      String(nombre_kpi).trim() === '' || 
      meta_valor === undefined || 
      meta_valor === null || 
      meta_valor === ''
    ) {
      res.status(400).json({ 
        success: false, 
        message: 'El proyecto, el nombre del KPI y la meta son obligatorios y no pueden estar vacíos.' 
      });
      return;
    }

    const proyectoIdStr = String(proyectoId);
    const metaNum = Number(meta_valor);
    const valorActualNum = valor_actual !== undefined && valor_actual !== '' ? Number(valor_actual) : 0;

    // Transacción para crear el KPI y registrar en auditoría simultáneamente
    const resultado = await prisma.$transaction(async (tx) => {
      const nuevoKpi = await tx.kpi.create({
        data: {
          proyecto_id: proyectoIdStr,
          nombre_kpi: String(nombre_kpi).trim(),
          descripcion: descripcion ? String(descripcion).trim() : '',
          meta_valor: metaNum,
          valor_actual: valorActualNum,
          unidad_medida: unidad_medida || '%',
          frecuencia: frecuencia || 'Mensual',
        },
      });

      // Registro automático en el log de auditorías
      await tx.logs_auditoria.create({
        data: {
          id_usuario_accion: idUsuarioAccion,
          id_proyecto: proyectoIdStr,
          campo_modificado: 'crear_kpi',
          valor_anterior: 'No existía',
          valor_nuevo: `KPI creado: ${nombre_kpi} (Meta: ${metaNum} ${unidad_medida || '%'})`,
          fecha_transaccion: new Date()
        }
      });

      return nuevoKpi;
    });

    res.status(201).json({ success: true, message: 'KPI creado exitosamente y registrado en auditoría', data: resultado });
  } catch (error: any) {
    console.error("❌ Error al crear KPI:", error);
    res.status(500).json({ success: false, message: 'Error al registrar el KPI.', error: error.message });
  }
};

// 🟢 PUT / POST: Actualizar el valor actual de un KPI y registrar su historial
export const actualizarValorKpi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID del KPI
    const { valor_nuevo, usuario_id } = req.body;

    if (valor_nuevo === undefined) {
      res.status(400).json({ success: false, message: 'El nuevo valor es obligatorio.' });
      return;
    }

    const kpiIdNum = Number(id);

    const kpiActualizado = await prisma.kpi.update({
      where: { id: kpiIdNum },
      data: { valor_actual: Number(valor_nuevo) },
    });

    await prisma.historialKpi.create({
      data: {
        kpi_id: kpiIdNum,
        valor_registrado: Number(valor_nuevo),
        usuario_id: usuario_id ? Number(usuario_id) : null,
      },
    });

    res.json({ success: true, message: 'Medición de KPI actualizada con éxito', data: kpiActualizado });
  } catch (error: any) {
    console.error("❌ Error al actualizar KPI:", error);
    res.status(500).json({ success: false, message: 'Error al actualizar el KPI.', error: error.message });
  }
};