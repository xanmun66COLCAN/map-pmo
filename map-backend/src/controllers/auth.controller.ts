import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../db';
import { registrarAuditoria } from '../helpers/auditoria.helper';

const MAPA_ROLES: Record<number, string> = {
  1: 'ADMINISTRADOR',
  2: 'LIDER_PMO',
  3: 'SOLICITANTE',
  4: 'REVISOR'
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      res.status(400).json({ message: 'Correo y contraseña son requeridos' });
      return;
    }

    const query = 'SELECT * FROM usuarios WHERE LOWER(correo) = LOWER($1)';
    const result = await pool.query(query, [correo]);

    if (result.rows.length === 0) {
      await registrarAuditoria(null, 'LOGIN_FALLIDO', `Intento de acceso con correo inexistente: ${correo}`);
      res.status(401).json({ message: 'Credenciales incorrectas (Usuario no encontrado)' });
      return;
    }

    const usuario = result.rows[0];
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
      await registrarAuditoria(usuario.id, 'LOGIN_FALLIDO', `Contraseña incorrecta para el usuario ${usuario.correo}`);
      res.status(401).json({ message: 'Credenciales incorrectas (Contraseña inválida)' });
      return;
    }

    const rolNombre = MAPA_ROLES[usuario.id_rol] || 'SOLICITANTE';
    const secretKey = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
    const token = jwt.sign(
      { 
        id: usuario.id,           
        correo: usuario.correo, 
        rol: Number(usuario.id_rol) 
      },
      secretKey,
      { expiresIn: '8h' }
    );

    await registrarAuditoria(
      usuario.id, 
      'LOGIN_EXITOSO', 
      `El usuario ${usuario.correo} inició sesión exitosamente en el sistema.`
    );

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