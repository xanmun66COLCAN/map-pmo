const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Iniciando revisión de departamentos vacíos...");

  // Buscar todos los proyectos que tienen departamento como NULL o vacío
  const proyectosSinDepartamento = await prisma.proyecto.findMany({
    where: {
      OR: [
        { departamento: null },
        { departamento: '' }
      ]
    }
  });

  if (proyectosSinDepartamento.length === 0) {
    console.log("✅ Todos los proyectos ya tienen un departamento asignado.");
    return;
  }

  console.log(`⚠️ Se encontraron ${proyectosSinDepartamento.length} proyectos sin departamento.`);

  // Actualizar uno por uno
  for (const p of proyectosSinDepartamento) {
    await prisma.proyecto.update({
      where: { id: p.id },
      data: { departamento: 'Sin asignar' } // Puedes cambiar esto por 'Tecnología' si lo prefieres
    });
    console.log(`🔄 Proyecto "${p.nombre}" actualizado a 'Sin asignar'`);
  }

  console.log("🚀 ¡Proceso finalizado con éxito!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });