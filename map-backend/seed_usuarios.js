const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Obtener el hash de la contraseña del admin
    const admin = await prisma.usuario.findUnique({
      where: { id: 2 }
    });

    if (!admin) {
      console.error('❌ No se encontró el usuario administrador.');
      return;
    }

    // 2. Verificar/Crear roles básicos en caso de que no existan
    const rolesBase = ['Administrador', 'Líder de Proyecto', 'Analista PMO', 'Sponsor'];
    for (const nombreRol of rolesBase) {
      await prisma.roles.upsert({
        where: { nombre_rol: nombreRol },
        update: {},
        create: { nombre_rol: nombreRol }
      });
    }

    const rolLider = await prisma.roles.findUnique({ where: { nombre_rol: 'Líder de Proyecto' } });
    const rolAnalista = await prisma.roles.findUnique({ where: { nombre_rol: 'Analista PMO' } });
    const rolSponsor = await prisma.roles.findUnique({ where: { nombre_rol: 'Sponsor' } });

    // 3. Usuarios de prueba a registrar
    const usuariosPrueba = [
      {
        nombre: 'Carlos Mendoza',
        correo: 'carlos.mendoza@map-pmo.com',
        contrasena: admin.contrasena,
        id_rol: rolLider?.id
      },
      {
        nombre: 'Ana María Gómez',
        correo: 'ana.gomez@map-pmo.com',
        contrasena: admin.contrasena,
        id_rol: rolAnalista?.id
      },
      {
        nombre: 'Roberto Silva',
        correo: 'roberto.silva@map-pmo.com',
        contrasena: admin.contrasena,
        id_rol: rolSponsor?.id
      },
      {
        nombre: 'Alexander Munoz',
        correo: 'alex2026@pmo.com',
        contrasena: admin.contrasena,
        id_rol: rolLider?.id // 👈 CORREGIDO
      },
    ];

    console.log('🌱 Insertando usuarios de prueba...');

    for (const user of usuariosPrueba) {
      await prisma.usuario.upsert({
        where: { correo: user.correo },
        update: { contrasena: admin.contrasena },
        create: user
      });
    }

    console.log('✅ Usuarios de prueba listos.');

  } catch (error) {
    console.error('❌ Error al sembrar usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();