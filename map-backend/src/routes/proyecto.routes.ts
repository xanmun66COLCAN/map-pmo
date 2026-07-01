import { Router } from 'express';
import { getProyectosDashboard } from '../controllers/proyecto.controller';

const router = Router();

// Definimos la ruta GET para el listado principal
router.get('/proyectos', getProyectosDashboard);

export default router;