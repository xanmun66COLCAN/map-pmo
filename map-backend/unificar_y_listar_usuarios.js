const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Buscando usuario administrador...');

    // 1. Buscar el usuario admin para obtener su hash de contraseña
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
      console.error('❌ No se encontró el usuario administrador. Verifica la condición de búsqueda.');
      return;
    }

    console.log(`🔑 Copiando contraseña desde: ${admin.nombre} (${admin.correo})`);

    // 2. Actualizar las contraseñas de TODOS los usuarios con el hash del admin
    const actualizacion = await prisma.usuario.updateMany({
      data: {
        contrasena: admin.contrasena
      }
    });

    console.log(`✅ ${actualizacion.count} usuario(s) actualizado(s) exitosamente.\n`);

    // 3. Consultar la lista de usuarios trayendo el nombre del rol usando 'include'
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        correo: true,
        fecha_creacion: true,
        roles: {
          select: {
            nombre_rol: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    // 4. Formatear los datos para mostrarlos claramente en consola
    const tablaUsuarios = usuarios.map((user) => ({
      ID: user.id,
      Nombre: user.nombre,
      Correo: user.correo,
      Rol: user.roles ? user.roles.nombre_rol : 'Sin Rol Asignado',
      Fecha_Creacion: user.fecha_creacion ? user.fecha_creacion.toISOString().split('T')[0] : 'N/A'
    }));

    console.log('👥 Lista general de usuarios y sus roles:');
    console.table(tablaUsuarios);

  } catch (error) {
    console.error('❌ Error al procesar los usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();