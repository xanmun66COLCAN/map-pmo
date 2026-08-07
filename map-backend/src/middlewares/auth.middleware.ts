import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Tipamos el contenido esperado dentro del Token JWT
export interface JwtPayloadCustom {
  id: string;
  correo: string;
  rol?: string;
  iat?: number;
  exp?: number;
}

// 2. Extendemos la interfaz Request de Express
export interface AuthRequest extends Request {
  usuario?: JwtPayloadCustom;
}

export const verificarToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer <TOKEN>"

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Acceso denegado. Se requiere un token de autenticación.',
    });
    return;
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
    const verificado = jwt.verify(token, secretKey) as JwtPayloadCustom;

    req.usuario = verificado;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Token inválido o expirado.',
    });
    return;
  }
};

export default verificarToken;