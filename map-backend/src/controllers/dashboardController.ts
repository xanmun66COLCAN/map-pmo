import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardKPIs = async (req: Request, res: Response) => {
  try {
    const totalProyectos = await prisma.proyecto.count();

    const avancePromedioResult = await prisma.proyecto.aggregate({
      _avg: {
        porcentaje_avance: true
      },
      _sum: {
        presupuesto: true,
        costo_real: true
      }
    });

    // Convertimos los tipos Decimal de Prisma a number de JS
    const avancePromedio = Math.round(avancePromedioResult._avg.porcentaje_avance || 0);
    const presupuestoTotal = Number(avancePromedioResult._sum.presupuesto || 0);
    const costoRealTotal = Number(avancePromedioResult._sum.costo_real || 0);

    const proyectosPorEstadoRaw = await prisma.proyecto.groupBy({
      by: ['estado'],
      _count: {
        id: true
      }
    });

    const proyectosPorEstado = proyectosPorEstadoRaw.map((item) => ({
      estado: item.estado,
      cantidad: item._count.id
    }));

    const porDepartamentoRaw = await prisma.proyecto.groupBy({
      by: ['departamento'],
      _sum: {
        presupuesto: true,
        costo_real: true
      },
      _count: {
        id: true
      }
    });

    const porDepartamento = porDepartamentoRaw.map((item) => ({
      departamento: item.departamento || 'Sin Especificar',
      presupuesto: Number(item._sum.presupuesto || 0),
      costo_real: Number(item._sum.costo_real || 0),
      total_proyectos: item._count.id
    }));

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalProyectos,
          avancePromedio,
          presupuestoTotal,
          costoRealTotal,
          ejecucionFinanciera: presupuestoTotal > 0 
            ? Math.round((costoRealTotal / presupuestoTotal) * 100) 
            : 0
        },
        proyectosPorEstado,
        porDepartamento
      }
    });

  } catch (error: any) {
    console.error('❌ Error al consultar métricas del Dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las métricas del Dashboard',
      error: error.message
    });
  }
};