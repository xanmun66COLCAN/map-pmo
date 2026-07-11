import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../db'; // Asegúrate de que apunte a tu pool de Postgres

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { correo, contrasena } = req.body;

    // 1. Validar que vengan los datos
    if (!correo || !contrasena) {
      res.status(400).json({ message: 'Correo y contraseña son requeridos' });
      return;
    }

    // 2. Buscar al usuario en la base de datos
    const query = 'SELECT * FROM usuarios WHERE LOWER(correo) = LOWER($1)';
    const result = await pool.query(query, [correo]);

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Credenciales incorrectas (Usuario no encontrado)' });
      return;
    }

    const usuario = result.rows[0];

    // 3. Verificar contraseña usando Bcrypt real
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
      res.status(401).json({ message: 'Credenciales incorrectas (Contraseña inválida)' });
      return;
    }

    // 4. Generar el Token JWT usando la clave secreta del .env
    const secretKey = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
    const token = jwt.sign(
      { 
        id_usuario: usuario.id, 
        correo: usuario.correo, 
        id_rol: usuario.id_rol 
      },
      secretKey,
      { expiresIn: '8h' }
    );

    // 5. Clonar el usuario para eliminar la contraseña de forma segura sin mutar directamente el row original de forma estricta
    const { contrasena: _, ...usuarioSinContrasena } = usuario;

    // 6. Responder al frontend con el éxito total y el TOKEN
    res.status(200).json({
      message: '¡Inicio de sesión exitoso!',
      token,
      usuario: usuarioSinContrasena
    });

  } catch (error: any) {
    console.error('❌ Error en el controlador de login:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};