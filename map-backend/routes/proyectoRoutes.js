// routes/proyectoRoutes.js
const express = require('express');
const router = express.Router();
const { crearProyecto } = require('../controllers/proyectoController');

// Definición del endpoint POST
router.post('/proyectos', crearProyecto);

module.exports = router;