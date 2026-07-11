import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface RequestExtendida extends Request {
  usuario?: any;
}

const verificarToken = (req: RequestExtendida, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: "Acceso denegado. Se requiere un token de autenticación." });
    return;
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
    const verificado = jwt.verify(token, secretKey);
    
    req.usuario = verificado; 
    next(); 
  } catch (error) {
    res.status(403).json({ error: "Token inválido o expirado." });
  }
};

export default verificarToken;