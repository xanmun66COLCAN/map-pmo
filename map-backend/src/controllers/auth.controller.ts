import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../db';
import { registrarAuditoria } from '../helpers/auditoria.helper'; // 👈 Importamos el helper de auditoría

// Diccionario para convertir el número a string
const MAPA_ROLES: Record<number, string> = {
  1: 'ADMINISTRADOR',
  2: 'LIDER_PMO',
  3: 'SOLICITANTE',
  4: 'REVISOR'
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { correo, contrasena } = req.body;

    // 1. Validar datos
    if (!correo || !contrasena) {
      res.status(400).json({ message: 'Correo y contraseña son requeridos' });
      return;
    }

    // 2. Buscar usuario simple (sin join)
    const query = 'SELECT * FROM usuarios WHERE LOWER(correo) = LOWER($1)';
    const result = await pool.query(query, [correo]);

    if (result.rows.length === 0) {
      // Opcional: Registrar intento fallido con correo desconocido
      await registrarAuditoria(null, 'LOGIN_FALLIDO', `Intento de acceso con correo inexistente: ${correo}`);
      
      res.status(401).json({ message: 'Credenciales incorrectas (Usuario no encontrado)' });
      return;
    }

    const usuario = result.rows[0];

    // 3. Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
      // Registrar intento fallido por contraseña errónea
      await registrarAuditoria(usuario.id, 'LOGIN_FALLIDO', `Contraseña incorrecta para el usuario ${usuario.correo}`);

      res.status(401).json({ message: 'Credenciales incorrectas (Contraseña inválida)' });
      return;
    }

    // 4. Mapear el id_rol a su nombre en texto
    const rolNombre = MAPA_ROLES[usuario.id_rol] || 'SOLICITANTE';

    // 5. Generar Token JWT
    const secretKey = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
    const token = jwt.sign(
      { 
        id: usuario.id,           // 👈 ID del usuario
        correo: usuario.correo, 
        rol: Number(usuario.id_rol) // 👈 Guardamos el número de rol directamente aquí (1, 2, 3, etc.)
      },
      secretKey,
      { expiresIn: '8h' }
    );

    // 6. Registrar login exitoso en la tabla de auditoría
    await registrarAuditoria(
      usuario.id, 
      'LOGIN_EXITOSO', 
      `El usuario ${usuario.correo} inició sesión exitosamente en el sistema.`
    );

    // 7. Respuesta limpia al frontend
    res.status(200).json({
      message: '¡Inicio de sesión exitoso!',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: rolNombre
      }
    });

  } catch (error: any) {
    console.error('❌ Error en el controlador de login:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};