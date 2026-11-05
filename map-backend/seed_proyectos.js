const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Sembrando proyectos de prueba realistas...');

    const proyectosPrueba = [
      {
        codigo: 'MAP-2026-001',
        nombre: 'Migración Infraestructura On-Premise a AWS Cloud',
        descripcion: 'Migración de servidores legacy y bases de datos relacionales a la nube de AWS para mejorar alta disponibilidad.',
        estado: 'En_Proceso',
        departamento: 'Tecnología',
        lider_proyecto: 'Carlos Mendoza',
        presupuesto: 45000000.00,
        costo_real: 18500000.00,
        porcentaje_avance: 42,
        fecha_inicio: new Date('2026-01-15'),
        fecha_fin: new Date('2026-11-30')
      },
      {
        codigo: 'MAP-2026-002',
        nombre: 'Implementación Sistema CRM de Ventas',
        descripcion: 'Adopción e integración de plataforma CRM para automatizar la gestión de prospectos y fuerza de ventas.',
        estado: 'Aprobado',
        departamento: 'Comercial',
        lider_proyecto: 'Alexander Munoz',
        presupuesto: 28000000.00,
        costo_real: 2500000.00,
        porcentaje_avance: 10,
        fecha_inicio: new Date('2026-05-01'),
        fecha_fin: new Date('2026-12-15')
      },
      {
        codigo: 'MAP-2026-003',
        nombre: 'Automatización de Procesos Operativos (RPA)',
        descripcion: 'Implementación de bots RPA para optimizar la conciliación de facturas y reportes contables mensuales.',
        estado: 'Caso_de_Negocio',
        departamento: 'Operaciones',
        lider_proyecto: 'Ana María Gómez',
        presupuesto: 15000000.00,
        costo_real: 0.00,
        porcentaje_avance: 0,
        fecha_inicio: new Date('2026-09-01'),
        fecha_fin: new Date('2027-02-28')
      },
      {
        codigo: 'MAP-2026-004',
        nombre: 'Certificación ISO 27001 Seguridad de la Información',
        descripcion: 'Auditoría interna, adecuación de políticas e implementación de controles SGSI para la certificación corporativa.',
        estado: 'En_Proceso',
        departamento: 'Riesgo y Cumplimiento',
        lider_proyecto: 'Roberto Silva',
        presupuesto: 32000000.00,
        costo_real: 21000000.00,
        porcentaje_avance: 65,
        fecha_inicio: new Date('2026-02-01'),
        fecha_fin: new Date('2026-10-15')
      },
      {
        codigo: 'MAP-2026-005',
        nombre: 'Renovación Portafolio Web & App Móvil',
        descripcion: 'Rediseño de la experiencia del usuario (UI/UX) e integración de nueva pasarela de pagos en la App.',
        estado: 'Completado',
        departamento: 'Marketing y Digital',
        lider_proyecto: 'Alexander Munoz',
        presupuesto: 22000000.00,
        costo_real: 21800000.00,
        porcentaje_avance: 100,
        fecha_inicio: new Date('2025-10-01'),
        fecha_fin: new Date('2026-04-30')
      },
      {
        codigo: 'MAP-2026-006',
        nombre: 'Actualización Core Financiero y ERP',
        descripcion: 'Upgrade de versión del ERP central para soportar nuevas regulaciones tributarias y facturación electrónica.',
        estado: 'En_Pausa',
        departamento: 'Finanzas',
        lider_proyecto: 'Carlos Mendoza',
        presupuesto: 60000000.00,
        costo_real: 15000000.00,
        porcentaje_avance: 25,
        fecha_inicio: new Date('2026-03-01'),
        fecha_fin: new Date('2027-01-15')
      }
    ];

    for (const proyecto of proyectosPrueba) {
      await prisma.proyecto.upsert({
        where: { codigo: proyecto.codigo },
        update: proyecto,
        create: proyecto
      });
    }

    console.log('✅ Proyectos de prueba creados/actualizados exitosamente.');

    // Mostrar resumen de los proyectos creados
    const resumen = await prisma.proyecto.findMany({
      select: {
        codigo: true,
        nombre: true,
        estado: true,
        departamento: true,
        presupuesto: true,
        porcentaje_avance: true
      },
      orderBy: { codigo: 'asc' }
    });

    console.log('\n📊 Proyectos disponibles en la base de datos:');
    console.table(resumen);

  } catch (error) {
    console.error('❌ Error al sembrar proyectos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();