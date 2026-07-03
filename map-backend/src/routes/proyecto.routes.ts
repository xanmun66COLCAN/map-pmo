import { Router } from 'express';
import { getProyectosDashboard, createProyecto } from '../controllers/proyecto.controller';

const router = Router();

// Listado principal (GET)
router.get('/proyectos', getProyectosDashboard);

// Creación de proyecto (POST)
router.post('/proyectos', createProyecto);

// Inicio de sesión (POST)

export default router;