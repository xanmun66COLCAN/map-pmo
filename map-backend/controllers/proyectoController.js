import { Request, Response } from 'express';
import { PrismaClient, estado_proyecto_enum } from '@prisma/client';

const prisma = new PrismaClient();

// 🟢 GET: Obtener todos los proyectos
export const getProyectos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const proyectos = await prisma.proyecto.findMany({
      orderBy: { fecha_creacion: 'desc' },
    });

    res.json({
      success: true,
      data: proyectos,
    });
  } catch (error: any) {
    console.error("❌ Error al obtener proyectos:", error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener la lista de proyectos.',
      error: error.message,
    });
  }
};

// 🟢 POST: Registrar un nuevo proyecto
export const crearProyecto = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      codigo,
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      presupuesto,
      departamento,
      lider_proyecto,
      estado,
    } = req.body;

    if (!nombre || !codigo || !fecha_inicio || !fecha_fin || !departamento || !lider_proyecto) {
      res.status(400).json({
        success: false,
        message: "Campos requeridos faltantes. 'codigo', 'nombre', 'fecha_inicio', 'fecha_fin', 'departamento' y 'lider_proyecto' son obligatorios.",
      });
      return;
    }

    const nuevoProyecto = await prisma.proyecto.create({
      data: {
        codigo,
        nombre,
        descripcion: descripcion || null,
        departamento,
        lider_proyecto,
        fecha_inicio: new Date(fecha_inicio),
        fecha_fin: new Date(fecha_fin),
        presupuesto: presupuesto ? parseFloat(presupuesto) : 0.00,
        estado: (estado as estado_proyecto_enum) || estado_proyecto_enum.Caso_de_Negocio,
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
      where: { id },
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

// ✏️ PUT / PATCH: Actualizar datos de un proyecto
export const actualizarProyecto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
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

    const dataAActualizar: any = {};

    if (nombre !== undefined) dataAActualizar.nombre = nombre;
    if (descripcion !== undefined) dataAActualizar.descripcion = descripcion;
    if (departamento !== undefined) dataAActualizar.departamento = departamento;
    if (lider_proyecto !== undefined) dataAActualizar.lider_proyecto = lider_proyecto;
    if (fecha_inicio) dataAActualizar.fecha_inicio = new Date(fecha_inicio);
    if (fecha_fin) dataAActualizar.fecha_fin = new Date(fecha_fin);
    if (presupuesto !== undefined) dataAActualizar.presupuesto = parseFloat(presupuesto);
    if (costo_real !== undefined) dataAActualizar.costo_real = parseFloat(costo_real);
    if (porcentaje_avance !== undefined) dataAActualizar.porcentaje_avance = parseFloat(porcentaje_avance);
    if (estado) dataAActualizar.estado = estado as estado_proyecto_enum;

    const proyectoActualizado = await prisma.proyecto.update({
      where: { id },
      data: dataAActualizar,
    });

    res.json({
      success: true,
      mensaje: "Proyecto actualizado exitosamente.",
      data: proyectoActualizado,
    });
  } catch (error: any) {
    console.error("❌ Error al actualizar el proyecto:", error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar el proyecto.',
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