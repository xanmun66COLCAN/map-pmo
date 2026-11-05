// actualizar_passwords.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Obtener el usuario administrador para copiar su hash de contraseña
    // Ajusta el correo o ID del admin según corresponda en tu BD
    const admin = await prisma.usuario.findFirst({
      where: {
        OR: [
          { correo: { contains: 'admin' } },
          { nombre: { contains: 'admin' } },
          { id: 1 }
        ]
      }
    });

    if (!admin) {
      console.error('❌ No se encontró ningún usuario Administrador para copiar la contraseña.');
      return;
    }

    console.log(`🔑 Copiando la contraseña del usuario: ${admin.nombre} (${admin.correo})`);

    // 2. Actualizar la contraseña de TODOS los usuarios con el mismo hash del admin
    const resultado = await prisma.usuario.updateMany({
      data: {
        contrasena: admin.contrasena
      }
    });

    console.log(`✅ Contraseña actualizada para ${resultado.count} usuarios.`);

    // 3. Mostrar la lista de usuarios generados actualmente
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        correo: true,
        id_rol: true,
        fecha_creacion: true
      },
      orderBy: { id: 'asc' }
    });

    console.log('\n👥 Usuarios en el sistema:');
    console.table(usuarios);

  } catch (error) {
    console.error('❌ Error al actualizar contraseñas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();