import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const registrarAuditoria = async (
  id_usuario: number | null,
  accion: string,
  detalles: string,
  idProyecto: string | null = null
) => {
  try {
    const nuevoLog = await prisma.logs_auditoria.create({
      data: {
        id_usuario_accion: id_usuario,
        id_proyecto: idProyecto,
        campo_modificado: accion,
        valor_anterior: 'Sistema',
        valor_nuevo: detalles,
        fecha_transaccion: new Date()
      }
    });
    console.log('✅ Auditoría registrada con éxito en logs_auditoria:', nuevoLog.id);
  } catch (error) {
    console.error('❌ Error al registrar en auditoría:', error);
  }
};