const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Conexión a la base de datos
const { encriptarContrasena, compararContrasena, generarToken } = require('../utils/authHelper');
const verificarToken = require('../authMiddleware');
// ==========================================
// 1. RUTA DE REGISTRO: POST /api/auth/register
// ==========================================
router.post('/register', async (req, res) => {
    const { nombre, correo, contrasena, id_rol } = req.body;

    try {
        // Validación básica: verificar que no vengan campos vacíos
        if (!nombre || !correo || !contrasena || !id_rol) {
            return res.status(400).json({ error: "Todos los campos son obligatorios." });
        }

        // Verificar si el correo ya existe en la Base de Datos
        const usuarioExiste = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (usuarioExiste.rows.length > 0) {
            return res.status(400).json({ error: "El correo electrónico ya está registrado." });
        }

        // Cifrar la contraseña usando nuestro helper seguro
        const contrasenaCifrada = await encriptarContrasena(contrasena);

        // Insertar el nuevo usuario en la base de datos relacional
        const nuevoUsuario = await pool.query(
            'INSERT INTO usuarios (nombre, correo, contrasena, id_rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, correo, id_rol',
            [nombre, correo, contrasenaCifrada, id_rol]
        );

        res.status(201).json({
            mensaje: "Usuario registrado con éxito en MAP PMO.",
            usuario: nuevoUsuario.rows[0]
        });

    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ error: "Error interno del servidor al registrar el usuario." });
    }
});

// ==========================================
// 2. RUTA DE LOGIN: POST /api/auth/login
// ==========================================
router.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        if (!correo || !contrasena) {
            return res.status(400).json({ error: "Correo y contraseña son obligatorios." });
        }

        // Buscar al usuario por su correo
        const resultadoDb = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        
        if (resultadoDb.rows.length === 0) {
            return res.status(401).json({ error: "Credenciales incorrectas (El correo no existe)." });
        }

        const usuario = resultadoDb.rows[0];

        // Validar si la contraseña coincide desencriptándola internamente
        const contrasenaCorrecta = await compararContrasena(contrasena, usuario.contrasena);
        if (!contrasenaCorrecta) {
            return res.status(401).json({ error: "Credenciales incorrectas (Contraseña inválida)." });
        }

        // Generar el Token JWT con el ID y el Rol del usuario
        const token = generarToken(usuario.id, usuario.id_rol);

        // Responder con el token y los datos básicos del usuario para el Frontend
        res.json({
            mensaje: "Autenticación exitosa. ¡Bienvenido a MAP!",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                id_rol: usuario.id_rol
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error interno del servidor al iniciar sesión." });
    }
});

// ==========================================
// 3. RUTA DE CAMBIO DE CONTRASEÑA: PUT /api/auth/change-password
// ==========================================
router.post('/change-password', async (req, res) => {
    const { correo, contrasenaActual, nuevaContrasena } = req.body;

    try {
        // 1. Validación básica
        if (!correo || !contrasenaActual || !nuevaContrasena) {
            return res.status(400).json({ error: "Todos los campos son obligatorios." });
        }

        // 2. Buscar al usuario en la base de datos
        const resultadoDb = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (resultadoDb.rows.length === 0) {
            return res.status(404).json({ error: "El usuario no existe." });
        }

        const usuario = resultadoDb.rows[0];

        // 3. Verificar si la contraseña actual es correcta
        const contrasenaCorrecta = await compararContrasena(contrasenaActual, usuario.contrasena);
        if (!contrasenaCorrecta) {
            return res.status(401).json({ error: "La contraseña actual es incorrecta." });
        }

        // 4. Cifrar la NUEVA contraseña
        const nuevaContrasenaCifrada = await encriptarContrasena(nuevaContrasena);

        // 5. Actualizar en PostgreSQL
        await pool.query(
            'UPDATE usuarios SET contrasena = $1 WHERE id = $2',
            [nuevaContrasenaCifrada, usuario.id]
        );

        res.json({ mensaje: "Contraseña actualizada con éxito en MAP PMO." });

    } catch (error) {
        console.error("Error en cambio de contraseña:", error);
        res.status(500).json({ error: "Error interno del servidor al cambiar la contraseña." });
    }
});

module.exports = router;