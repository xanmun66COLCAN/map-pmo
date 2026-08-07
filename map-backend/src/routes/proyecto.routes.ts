import { Router } from 'express';
import { 
  getProyectosDashboard, 
  createProyecto, 
  getProyectoById // 👈 Importar nuevo controlador
} from '../controllers/proyecto.controller'; 
import verificarToken from '../authMiddleware';

const router = Router();

router.use(verificarToken);

// Endpoints
router.get('/dashboard', getProyectosDashboard);
router.get('/proyectos/:id', getProyectoById); // 👈 Nueva ruta de detalle
router.post('/proyectos', createProyecto);

export default router;