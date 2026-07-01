import { PrismaClient, EstadoProyecto, FrecuenciaMedicion } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando el proceso de seeding...');

  // 1. Limpiar datos existentes (por si acaso se corre más de una vez)
  await prisma.historialKpi.deleteMany();
  await prisma.kpi.deleteMany();
  await prisma.asignacionRecurso.deleteMany();
  await prisma.proyecto.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🧹 Base de datos limpia.');

  // 2. Crear Usuarios de prueba
  const usuarioAdmin = await prisma.usuario.create({
    data: {
      email: 'admin@map-pmo.com',
      password: 'password_super_seguro_123', // En producción se encriptará
      nombre: 'Alex',
      apellido: 'Munoz',
    },
  });

  const usuarioDev = await prisma.usuario.create({
    data: {
      email: 'desarrollador@map-pmo.com',
      password: 'password_dev_456',
      nombre: 'Juan',
      apellido: 'Pérez',
    },
  });

  console.log('👥 Usuarios creados.');

  // 3. Crear Proyectos
  const proyecto1 = await prisma.proyecto.create({
    data: {
      nombre: 'Desarrollo de Plataforma MAP Core',
      descripcion: 'Construcción del backend y frontend principal de la suite de gestión PMO.',
      fecha_inicio: new Date('2026-06-01'),
      estado: EstadoProyecto.En_Ejecucion,
      presupuesto: 15000.00,
    },
  });

  const proyecto2 = await prisma.proyecto.create({
    data: {
      nombre: 'Módulo de Analítica Avanzada',
      descripcion: 'Fase de diseño para la integración de reportes predictivos de KPIs.',
      fecha_inicio: new Date('2026-08-01'),
      estado: EstadoProyecto.Planificacion,
      presupuesto: 5000.00,
    },
  });

  console.log('📂 Proyectos creados.');

  // 4. Asignar Recursos (Usuarios) a los Proyectos
  await prisma.asignacionRecurso.createMany({
    data: [
      {
        proyecto_id: proyecto1.id,
        usuario_id: usuarioAdmin.id,
        porcentaje_asignacion: 50, // Dedica el 50% de su tiempo
        fecha_desde: new Date('2026-06-01'),
      },
      {
        proyecto_id: proyecto1.id,
        usuario_id: usuarioDev.id,
        porcentaje_asignacion: 100, // Dedica el 100% de su tiempo
        fecha_desde: new Date('2026-06-01'),
      },
    ],
  });

  console.log('🔗 Recursos asignados a los proyectos.');

  // 5. Crear un KPI para el Proyecto 1
  const kpiBackend = await prisma.kpi.create({
    data: {
      proyecto_id: proyecto1.id,
      nombre_kpi: 'Avance del Desarrollo Backend',
      descripcion: 'Mide el porcentaje de completitud de los endpoints y base de datos.',
      meta_valor: 100.00,
      valor_actual: 35.00,
      frecuencia: FrecuenciaMedicion.Semanal,
      unidad_medida: '%',
    },
  });

  console.log('📈 KPIs creados.');

  // 6. Crear un Historial de registros para ese KPI (Simular progreso)
  await prisma.historialKpi.createMany({
    data: [
      {
        kpi_id: kpiBackend.id,
        valor_registrado: 10.00,
        fecha_registro: new Date('2026-06-10'),
        usuario_id: usuarioDev.id,
      },
      {
        kpi_id: kpiBackend.id,
        valor_registrado: 25.00,
        fecha_registro: new Date('2026-06-17'),
        usuario_id: usuarioDev.id,
      },
      {
        kpi_id: kpiBackend.id,
        valor_registrado: 35.00,
        fecha_registro: new Date('2026-06-24'),
        usuario_id: usuarioAdmin.id,
      },
    ],
  });

  console.log('📜 Historial de KPIs poblado.');
  console.log('✅ ¡Seeding completado con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });