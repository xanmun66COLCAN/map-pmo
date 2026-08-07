import { PrismaClient, EstadoProyecto } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Poblando la base de datos de MAP PMO...');

  // 1. Limpiar registros anteriores
  await prisma.proyecto.deleteMany();

  // 2. Crear proyectos con la estructura exacta de prisma/schema.prisma
  await prisma.proyecto.create({
    data: {
      nombre: 'Modernización Infraestructura Cloud',
      descripcion: 'Migración de servidores legacy a arquitectura serverless en AWS.',
      estado: EstadoProyecto.Aprobado,
      fecha_inicio: new Date('2026-01-15'),
      fecha_fin: new Date('2026-11-30'),
      presupuesto: 120000.00,
    },
  });

  await prisma.proyecto.create({
    data: {
      nombre: 'Implementación Módulo CRM',
      descripcion: 'Automatización del pipeline de ventas e integración con correo.',
      estado: EstadoProyecto.Caso_de_Negocio,
      fecha_inicio: new Date('2026-03-01'),
      fecha_fin: new Date('2026-09-15'),
      presupuesto: 45000.00,
    },
  });

  console.log('✅ Base de datos poblada exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });