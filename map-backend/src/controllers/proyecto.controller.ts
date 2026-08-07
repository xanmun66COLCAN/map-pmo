import { Request, Response } from 'express';
import { PrismaClient, EstadoProyecto } from '@prisma/client';

// Extensión local simple de Request sin importar ningún archivo externo
export interface AuthRequest extends Request {
  usuario?: any;
}

const prisma = new PrismaClient();

// 📊 GET: Obtener métricas y resumen del Dashboard de Proyectos
export const getProyectosDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalProyectos,
      proyectosPorEstado,
      agregadoPresupuesto,
      ultimosProyectos
    ] = await Promise.all([
      // A. Total de proyectos registrados
      prisma.proyecto.count(),

      // B. Conteo agrupado por Estado
      prisma.proyecto.groupBy({
        by: ['estado'],
        _count: {
          estado: true,
        },
      }),

      // C. Agregación financiera y de avance
      prisma.proyecto.aggregate({
        _sum: {
          presupuesto: true,
          costo_real: true,
        },
        _avg: {
          porcentaje_avance: true,
        },
      }),

      // D. Últimos 5 proyectos registrados
      prisma.proyecto.findMany({
        take: 5,
        orderBy: {
          fecha_inicio: 'desc', // Usamos fecha_inicio o id
        },
        select: {
          id: true,
          nombre: true,
          estado: true,
          porcentaje_avance: true,
          presupuesto: true,
          costo_real: true,
        },
      }),
    ]);

    // Mapeo seguro de estados dinámicos
    const estadoConteo = proyectosPorEstado.reduce((acc, curr) => {
      acc[curr.estado] = curr._count.estado;
      return acc;
    }, {} as Record<string, number>);

    // Conversión explícita a número para manejar posibles tipos Prisma.Decimal
    const totalPresupuesto = Number(agregadoPresupuesto._sum.presupuesto || 0);
    const totalCostoReal = Number(agregadoPresupuesto._sum.costo_real || 0);
    const variacionPresupuestaria = totalPresupuesto - totalCostoReal;

    res.json({
      success: true,
      data: {
        resumen: {
          totalProyectos,
          // Acceso flexible a las claves según el Enum
          proyectosActivos: (estadoConteo['En_Ejecucion'] || estadoConteo['Ejecucion'] || 0) + 
                           (estadoConteo['Planificacion'] || estadoConteo['En_Planificacion'] || 0),
          proyectosCompletados: estadoConteo['Cierre'] || estadoConteo['Completado'] || 0,
          promedioAvanceGeneral: Number((agregadoPresupuesto._avg.porcentaje_avance || 0).toFixed(2)),
        },
        finanzas: {
          totalPresupuesto,
          totalCostoReal,
          variacionPresupuestaria,
          saludFinanciera: totalCostoReal > totalPresupuesto ? 'Sobre Presupuesto' : 'En Presupuesto',
        },
        distribucionPorEstado: estadoConteo,
        proyectosRecientes: ultimosProyectos,
      },
    });

  } catch (error: any) {
    console.error("❌ Error en getProyectosDashboard:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al calcular el dashboard de proyectos.",
      error: error.message,
    });
  }
};

// ➕ 2. CREATE: Crear proyecto / iniciativa (Exportado como crearProyecto para coincidir con rutas)
export const crearProyecto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      nombre, 
      descripcion, 
      fechaInicio, 
      fecha_inicio, 
      fechaFin, 
      fecha_fin, 
      presupuesto, 
      estado, 
      kpis 
    } = req.body;

    if (!nombre) {
      res.status(400).json({
        success: false,
        message: 'El nombre del proyecto o iniciativa es obligatorio.'
      });
      return;
    }

    const fechaInicioValida = fecha_inicio || fechaInicio;
    const fechaFinValida = fecha_fin || fechaFin;

    const nuevoProyecto = await prisma.proyecto.create({
      data: {
        nombre,
        descripcion: descripcion || '',
        fecha_inicio: fechaInicioValida ? new Date(fechaInicioValida) : new Date(),
        fecha_fin: fechaFinValida ? new Date(fechaFinValida) : null,
        presupuesto: presupuesto ? Number(presupuesto) : 0,
        estado: estado || 'Idea',
        kpis: kpis && kpis.length > 0
          ? {
              create: kpis.map((kpi: any) => ({
                nombre_kpi: kpi.nombre || kpi.nombre_kpi,
                meta_valor: kpi.valorObjetivo || kpi.meta_valor || 0,
                unidad_medida: kpi.unidadMedida || kpi.unidad_medida || '%'
              }))
            }
          : undefined
      },
      include: {
        kpis: true,
        asignaciones: true
      }
    });

    res.status(201).json({
      success: true,
      data: nuevoProyecto
    });

  } catch (error: any) {
    console.error("❌ Error al crear el proyecto:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor al crear el proyecto',
      error
    });
  }
};

// 🔍 3. GET BY ID: Consultar proyecto por ID
export const getProyectoById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Si la llave primaria en schema.prisma es Int se usa Number(id), si es String/UUID se pasa directamente 'id'
    const idParam = !isNaN(Number(id)) ? Number(id) : id;

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: idParam as any },
      include: {
        kpis: true,
        asignaciones: {
          include: {
            usuario: {
              select: {
                nombre: true,
                correo: true
              }
            }
          }
        }
      }
    });

    if (!proyecto) {
      res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
      return;
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).json({ success: true, data: proyecto });
  } catch (error: any) {
    console.error('❌ Error al obtener el proyecto por ID:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// ✏️ 4. UPDATE: Actualizar datos de un proyecto existente
export const updateProyecto = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const idParam = !isNaN(Number(id)) ? Number(id) : id;

    // 1. Verificar si el proyecto existe en la base de datos
    const proyectoExistente = await prisma.proyecto.findUnique({
      where: { id: idParam as any }
    });

    if (!proyectoExistente) {
      res.status(404).json({
        success: false,
        message: 'No se encontró el proyecto que deseas actualizar.'
      });
      return;
    }

    // 2. Extraemos los campos del body
    const {
      nombre,
      descripcion,
      fechaInicio,
      fecha_inicio,
      fechaFin,
      fecha_fin,
      presupuesto,
      costoReal,
      costo_real,
      porcentajeAvance,
      porcentaje_avance,
      departamento,
      liderProyecto,
      lider_proyecto,
      estado
    } = req.body;

    const fechaInicioValida = fecha_inicio || fechaInicio;
    const fechaFinValida = fecha_fin || fechaFin;

    // 3. Ejecutar la actualización parcial en PostgreSQL
    const proyectoActualizado = await prisma.proyecto.update({
      where: { id: idParam as any },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(fechaInicioValida !== undefined && { fecha_inicio: new Date(fechaInicioValida) }),
        ...(fechaFinValida !== undefined && { fecha_fin: fechaFinValida ? new Date(fechaFinValida) : null }),
        ...(presupuesto !== undefined && { presupuesto: Number(presupuesto) }),
        ...((costo_real !== undefined || costoReal !== undefined) && { costo_real: Number(costo_real ?? costoReal) }),
        ...((porcentaje_avance !== undefined || porcentajeAvance !== undefined) && { porcentaje_avance: Number(porcentaje_avance ?? porcentajeAvance) }),
        ...(departamento !== undefined && { departamento }),
        ...((lider_proyecto !== undefined || liderProyecto !== undefined) && { lider_proyecto: lider_proyecto ?? liderProyecto }),
        ...(estado !== undefined && { estado })
      },
      include: {
        kpis: true,
        asignaciones: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Proyecto actualizado correctamente.',
      data: proyectoActualizado
    });

  } catch (error: any) {
    console.error("❌ Error en updateProyecto:", error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar el proyecto.',
      error: error.message
    });
  }
};

// 🗑️ 5. DELETE: Eliminar un proyecto por su ID
export const deleteProyecto = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const idParam = !isNaN(Number(id)) ? Number(id) : id;

    // 1. Verificar si el proyecto existe antes de intentar eliminarlo
    const proyectoExistente = await prisma.proyecto.findUnique({
      where: { id: idParam as any }
    });

    if (!proyectoExistente) {
      res.status(404).json({
        success: false,
        message: 'No se encontró el proyecto que deseas eliminar.'
      });
      return;
    }

    // 2. Eliminar de la base de datos
    await prisma.proyecto.delete({
      where: { id: idParam as any }
    });

    res.status(200).json({
      success: true,
      message: `El proyecto '${proyectoExistente.nombre}' fue eliminado exitosamente.`,
      data: { id: idParam }
    });

  } catch (error: any) {
    console.error("❌ Error en deleteProyecto:", error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar el proyecto.',
      error: error.message
    });
  }
};

// 📋 6. GET ALL: Obtener la lista general de todos los proyectos
export const getProyectos = async (req: Request, res: Response): Promise<void> => {
  try {
    const proyectos = await prisma.proyecto.findMany({
      orderBy: {
        fecha_inicio: 'desc'
      },
      include: {
        kpis: true,
        asignaciones: {
          include: {
            usuario: {
              select: {
                nombre: true,
                correo: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      total: proyectos.length,
      data: proyectos
    });
  } catch (error: any) {
    console.error("❌ Error en getProyectos:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al obtener la lista de proyectos.",
      error: error.message
    });
  }
};