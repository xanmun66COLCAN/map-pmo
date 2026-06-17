const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 1. Encriptar la contraseña (Bcrypt) antes de guardarla en la Base de Datos
const encriptarContrasena = async (contrasenaClara) => {
    // Generamos un "salt" (una semilla aleatoria de seguridad) de 10 rondas
    const salt = await bcrypt.genSalt(10);
    // Retornamos la contraseña combinada con la semilla en un formato cifrado e irreversible
    return await bcrypt.hash(contrasenaClara, salt);
};

// 2. Comparar la contraseña que digita el usuario en el Login con el código cifrado guardado en la BD
const compararContrasena = async (contrasenaClara, contrasenaCifrada) => {
    return await bcrypt.compare(contrasenaClara, contrasenaCifrada);
};

// 3. Crear el Token JWT para el usuario logueado (Su pase de abordaje digital)
const generarToken = (usuarioId, idRol) => {
    // El token guardará el ID del usuario y su ROL de forma segura en su interior (payload)
    return jwt.sign(
        { id: usuarioId, id_rol: idRol }, 
        process.env.JWT_SECRET, 
        { expiresIn: '8h' } // El token vencerá automáticamente en 8 horas por seguridad
    );
};

module.exports = {
    encriptarContrasena,
    compararContrasena,
    generarToken
};