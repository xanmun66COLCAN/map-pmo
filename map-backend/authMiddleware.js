const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // 1. Obtener el token que viene en la cabecera 'Authorization'
    const authHeader = req.headers['authorization'];
    
    // El formato estándar es "Bearer TEXTO_DEL_TOKEN", así que separamos el texto por el espacio
    const token = authHeader && authHeader.split(' ')[1];

    // Si no mandaron ningún token, bloqueamos el acceso de inmediato
    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. Se requiere un token de autenticación." });
    }

    try {
        // 2. Verificar si el token es válido y no ha expirado usando tu firma secreta
        // (Asegúrate de que coincida con el nombre de tu variable en el .env, ej: process.env.JWT_SECRET)
        const verificado = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_por_defecto');
        
        // 3. ¡Aquí está la magia! Inyectamos los datos del usuario descifrados en el 'req'
        // para que la ruta final pueda saber quién es sin necesidad de pedir el correo
        req.usuario = verificado; 

        next(); // Le damos el pase para que continúe a la ruta
    } catch (error) {
        res.status(403).json({ error: "Token inválido o expirado." });
    }
};

module.exports = verificarToken;