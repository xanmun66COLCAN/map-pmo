import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Extendemos la interfaz de Express para que acepte la propiedad 'usuario'
export interface CustomRequest extends Request {
    usuario?: any; // Aquí se guardará el contenido del token (id, rol, etc.)
}

// 2. Cambiamos a la sintaxis de importación moderna de TypeScript
const verificarToken = (req: CustomRequest, res: Response, next: NextFunction): void => {
    const tokenHeader = req.header('Authorization');

    if (!tokenHeader) {
        res.status(403).json({ error: "Acceso denegado. No se proporcionó un token." });
        return; // En TS, usamos return vacío para cortar la ejecución de la función
    }

    try {
        const token = tokenHeader.split(" ")[1];
        if (!token) {
            res.status(403).json({ error: "Formato de token inválido. Debe ser 'Bearer [token]'" });
            return;
        }

        // Usamos el JWT_SECRET de las variables de entorno
        const verificado = jwt.verify(token, process.env.JWT_SECRET || 'C1av3S3cr3t4YSuP3rS3gur4D3MAP_PMO');
        
        req.usuario = verificado; // Guardamos los datos del usuario descifrados en la petición
        next(); 
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado." });
        return;
    }
};

// Exportación moderna
export default verificarToken;