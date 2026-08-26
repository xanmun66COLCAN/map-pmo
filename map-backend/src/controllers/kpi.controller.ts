import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🟢 GET: Obtener todos los KPIs de un proyecto específico
const getKpisByProyecto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { proyectoId } = req.params;

    const kpis = await prisma.kpi.findMany({
      where: { proyecto_id: proyectoId },
      include: { historial: true }, // Trae el histórico de mediciones
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: kpis });
  } catch (error: any) {
    console.error("❌ Error al obtener KPIs:", error);
    res.status(500).json({ success: false, message: 'Error interno al obtener los KPIs.', error: error.message });
  }
};

// 🟢 POST: Crear un nuevo KPI para una iniciativa
const crearKpi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { proyecto_id, nombre_kpi, descripcion, meta_valor, valor_actual, unidad_medida, frecuencia } = req.body;

    if (!proyecto_id || !nombre_kpi || meta_valor === undefined) {
      res.status(400).json({ success: false, message: 'El proyecto, el nombre del KPI y la meta son obligatorios.' });
      return;
    }

    const nuevoKpi = await prisma.kpi.create({
      data: {
        proyecto_id,
        nombre_kpi,
        descripcion: descripcion || '',
        meta_valor: Number(meta_valor),
        valor_actual: valor_actual !== undefined ? Number(valor_actual) : 0,
        unidad_medida: unidad_medida || '%',
        frecuencia: frecuencia || 'Mensual',
      },
    });

    res.status(201).json({ success: true, message: 'KPI creado exitosamente', data: nuevoKpi });
  } catch (error: any) {
    console.error("❌ Error al crear KPI:", error);
    res.status(500).json({ success: false, message: 'Error al registrar el KPI.', error: error.message });
  }
};

// 🟢 PUT / POST: Actualizar el valor actual de un KPI y registrar su historial
const actualizarValorKpi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID del KPI
    const { valor_nuevo, usuario_id } = req.body;

    if (valor_nuevo === undefined) {
      res.status(400).json({ success: false, message: 'El nuevo valor es obligatorio.' });
      return;
    }

    const kpiIdNum = Number(id);

    // 1. Actualizar el valor actual en la tabla principal de kpis
    const kpiActualizado = await prisma.kpi.update({
      where: { id: kpiIdNum },
      data: { valor_actual: Number(valor_nuevo) },
    });

    // 2. Registrar el cambio en la tabla de historial (historial_kpis)
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

export { getKpisByProyecto, crearKpi, actualizarValorKpi };