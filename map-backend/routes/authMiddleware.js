const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarToken = (req, res, next) => {
    const tokenHeader = req.header('Authorization');

    if (!tokenHeader) {
        return res.status(403).json({ error: "Acceso denegado. No se proporcionó un token." });
    }

    try {
        const token = tokenHeader.split(" ")[1];
        if (!token) {
            return res.status(403).json({ error: "Formato de token inválido. Debe ser 'Bearer [token]'" });
        }

        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado; // Guardamos los datos del usuario en la petición
        next(); 
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado." });
    }
};

module.exports = verificarToken;