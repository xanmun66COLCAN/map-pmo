// routes/proyectoRoutes.js
const express = require('express');
const router = express.Router();
const { crearProyecto } = require('../controllers/proyectoController');
const { verificarToken } = require('../middlewares/authMiddleware'); // Si usas JWT

// Ruta para crear un proyecto (asociada al formulario)
router.post('/', verificarToken, crearProyecto);

// Ruta para obtener todos los proyectos (asociada a la vista del Dashboard)
router.get('/', verificarToken, obtenerProyectos);

module.exports = router;