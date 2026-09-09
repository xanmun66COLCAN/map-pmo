import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando 10 proyectos completos en la base de datos...');

  const proyectosData = [
    {
      nombre: 'Migración de Infraestructura Cloud',
      codigo: 'PMO-2026-001',
      descripcion: 'Migración total de servidores locales físicos hacia la infraestructura en la nube de AWS con alta disponibilidad.',
      estado: 'En_Proceso' as any,
      presupuesto: 45000.00,
      departamento: 'Infraestructura y Redes',
      lider_proyecto: 'Fredy Muñoz',
      fecha_inicio: new Date('2026-01-15'),
      fecha_fin: new Date('2026-06-30'),
    },
    {
      nombre: 'Implementación de IA en Atención al Cliente',
      codigo: 'PMO-2026-002',
      descripcion: 'Desarrollo e integración de un chatbot inteligente basado en LLMs para soporte técnico automatizado 24/7.',
      estado: 'Caso_de_Negocio' as any,
      presupuesto: 28500.00,
      departamento: 'Innovación y Desarrollo',
      lider_proyecto: 'Equipo PMO',
      fecha_inicio: new Date('2026-03-01'),
      fecha_fin: new Date('2026-09-15'),
    },
    {
      nombre: 'Modernización del ERP Financiero',
      codigo: 'PMO-2026-003',
      descripcion: 'Actualización y reestructuración del módulo contable y financiero para cumplir con normativas fiscales vigentes.',
      estado: 'En_Proceso' as any,
      presupuesto: 62000.00,
      departamento: 'Finanzas',
      lider_proyecto: 'Fredy Muñoz',
      fecha_inicio: new Date('2026-02-01'),
      fecha_fin: new Date('2026-11-30'),
    },
    {
      nombre: 'Auditoría y Hardening de Ciberseguridad',
      codigo: 'PMO-2026-004',
      descripcion: 'Evaluación exhaustiva de vulnerabilidades, pruebas de penetración (pentesting) y aplicación de parches de seguridad.',
      estado: 'Completado' as any,
      presupuesto: 15000.00,
      departamento: 'Seguridad de la Información',
      lider_proyecto: 'Equipo PMO',
      fecha_inicio: new Date('2026-01-05'),
      fecha_fin: new Date('2026-02-28'),
    },
    {
      nombre: 'Transformación Digital de Canales de Ventas',
      codigo: 'PMO-2026-005',
      descripcion: 'Rediseño completo de la plataforma de e-commerce y pasarelas de pago para optimizar la experiencia de usuario.',
      estado: 'En_Proceso' as any,
      presupuesto: 39000.00,
      departamento: 'Comercial y Ventas',
      lider_proyecto: 'Fredy Muñoz',
      fecha_inicio: new Date('2026-03-10'),
      fecha_fin: new Date('2026-08-30'),
    },
    {
      nombre: 'Automatización de Procesos Operativos (RPA)',
      codigo: 'PMO-2026-006',
      descripcion: 'Implementación de robots de software para automatizar la conciliación bancaria y la facturación electrónica.',
      estado: 'En_Pausa' as any,
      presupuesto: 21000.00,
      departamento: 'Operaciones',
      lider_proyecto: 'Equipo PMO',
      fecha_inicio: new Date('2026-04-01'),
      fecha_fin: new Date('2026-10-15'),
    },
    {
      nombre: 'Rediseño de Arquitectura de Microservicios',
      codigo: 'PMO-2026-007',
      descripcion: 'Desacoplamiento del monolito heredado actual hacia contenedores Docker y orquestación con Kubernetes.',
      estado: 'Caso_de_Negocio' as any,
      presupuesto: 54000.00,
      departamento: 'Desarrollo de Software',
      lider_proyecto: 'Fredy Muñoz',
      fecha_inicio: new Date('2026-05-01'),
      fecha_fin: new Date('2026-12-15'),
    },
    {
      nombre: 'Portal de Autoservicio para Clientes',
      codigo: 'PMO-2026-008',
      descripcion: 'Creación de un panel web interactivo para que los clientes consulten contratos, facturas y estado de solicitudes.',
      estado: 'En_Proceso' as any,
      presupuesto: 19500.00,
      departamento: 'Atención al Cliente',
      lider_proyecto: 'Equipo PMO',
      fecha_inicio: new Date('2026-02-15'),
      fecha_fin: new Date('2026-07-15'),
    },
    {
      nombre: 'Despliegue de Data Warehouse y BI',
      codigo: 'PMO-2026-009',
      descripcion: 'Centralización de bases de datos operacionales y construcción de tableros ejecutivos en PowerBI para la alta gerencia.',
      estado: 'Caso_de_Negocio' as any,
      presupuesto: 33000.00,
      departamento: 'Inteligencia de Negocios',
      lider_proyecto: 'Fredy Muñoz',
      fecha_inicio: new Date('2026-06-01'),
      fecha_fin: new Date('2026-11-15'),
    },
    {
      nombre: 'Programa de Capacitación Ágil (Scrum/Kanban)',
      codigo: 'PMO-2026-010',
      descripcion: 'Ciclo de formación, talleres prácticos y certificación interna para alinear a los equipos de desarrollo bajo marcos ágiles.',
      estado: 'Completado' as any,
      presupuesto: 12000.00,
      departamento: 'Gestión de Talento y PMO',
      lider_proyecto: 'Equipo PMO',
      fecha_inicio: new Date('2026-01-10'),
      fecha_fin: new Date('2026-02-20'),
    },
  ];

  for (const proj of proyectosData) {
    await prisma.proyecto.create({
      data: proj,
    });
  }

  console.log('✅ ¡10 proyectos sembrados con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la siembra:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });