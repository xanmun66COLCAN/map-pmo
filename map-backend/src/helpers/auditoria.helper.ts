import pool from '../db';

export const registrarAuditoria = async (id_usuario: number | null, accion: string, detalles: string) => {
  try {
    const query = `
      INSERT INTO auditoria (id_usuario, accion, detalles) 
      VALUES ($1, $2, $3)
    `;
    await pool.query(query, [id_usuario, accion, detalles]);
  } catch (error) {
    console.error('❌ Error al registrar en auditoría:', error);
  }
};