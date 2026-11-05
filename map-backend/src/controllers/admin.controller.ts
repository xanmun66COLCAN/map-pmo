import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middlewares/auth.middleware';
import pool from '../db';
import { registrarAuditoria } from '../helpers/auditoria.helper'; // 👈 Importamos el helper de auditoría

// 📋 1. Listar todos los usuarios con su rol
export const obtenerUsuarios = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT u.id, u.nombre, u.correo, u.id_rol, r.nombre_rol 
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id
      ORDER BY u.id ASC;
    `;
    const result = await pool.query(query);

    // Mapeamos para mantener la estructura exacta que espera tu frontend
    const usuarios = result.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      correo: row.correo,
      id_rol: row.id_rol,
      rol: {
        nombre_rol: row.nombre_rol
      }
    }));

    res.status(200).json({ success: true, usuarios });
  } catch (error: any) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// ➕ 2. Crear un nuevo usuario
export const crearUsuarioAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nombre, correo, contrasena, id_rol } = req.body;

    if (!nombre || !correo || !contrasena || !id_rol) {
      res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
      return;
    }

    // Verificar si el correo ya existe
    const usuarioExistente = await pool.query('SELECT * FROM usuarios WHERE LOWER(correo) = LOWER($1)', [correo]);
    if (usuarioExistente.rows.length > 0) {
      res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado.' });
      return;
    }

    const saltRounds = 10;
    const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

    const query = `
      INSERT INTO usuarios (nombre, correo, contrasena, id_rol) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, nombre, correo, id_rol;
    `;
    const result = await pool.query(query, [nombre, correo, contrasenaHash, Number(id_rol)]);
    const nuevoUsuario = result.rows[0];

    // 📝 Registrar la creación en la auditoría
    await registrarAuditoria(
      Number(req.usuario?.id), 
      'CREAR_USUARIO', 
      `Se creó el usuario ${correo} con rol ID ${id_rol}.`
    );

    res.status(201).json({
      success: true,
      message: '¡Usuario creado exitosamente!',
      usuario: nuevoUsuario,
    });
  } catch (error: any) {
    console.error('❌ Error al crear usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno al registrar el usuario', error: error.message });
  }
};

// ✏️ 3. Actualizar el rol de un usuario
export const actualizarRolUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { id_rol } = req.body;

    const query = `
      UPDATE usuarios 
      SET id_rol = $1 
      WHERE id = $2 
      RETURNING id, nombre, correo, id_rol;
    `;
    const result = await pool.query(query, [Number(id_rol), Number(id)]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      return;
    }

    const usuarioModificado = result.rows[0];

    // Obtener nombre del rol actualizado para la respuesta
    const rolQuery = await pool.query('SELECT nombre_rol FROM roles WHERE id = $1', [Number(id_rol)]);
    const nombre_rol = rolQuery.rows[0]?.nombre_rol || 'SIN_ROL';

    // 📝 Registrar el cambio de rol en la auditoría
    await registrarAuditoria(
      Number(req.usuario?.id), 
      'CAMBIO_ROL', 
      `Se modificó el rol del usuario ${usuarioModificado.correo} al rol ID ${id_rol} (${nombre_rol}).`
    );

    res.status(200).json({
      success: true,
      message: 'Rol actualizado exitosamente',
      usuario: {
        ...usuarioModificado,
        rol: { nombre_rol }
      },
    });
  } catch (error: any) {
    console.error('❌ Error al actualizar rol:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el rol del usuario', error: error.message });
  }
};

// 📊 4. Obtener registros de auditoría reales
export const obtenerAuditoria = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT a.id, a.accion, a.detalles, a.fecha_transaccion, u.correo as usuario_correo
      FROM auditoria a
      LEFT JOIN usuarios u ON a.id_usuario = u.id
      ORDER BY a.fecha_transaccion DESC
      LIMIT 100;
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('❌ Error al obtener auditoría:', error);
    res.status(500).json({ success: false, message: 'Error interno al obtener auditoría', error: error.message });
  }
};