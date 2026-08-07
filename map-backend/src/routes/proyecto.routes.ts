import { Router } from 'express';
import { 
  getProyectosDashboard, 
  getProyectos,
  crearProyecto, 
  getProyectoById,
  updateProyecto,
  deleteProyecto
} from '../controllers/proyecto.controller'; 
import verificarToken from '../middlewares/auth.middleware';

const router = Router();

// 🔒 Aplicar autenticación JWT a todas las rutas
router.use(verificarToken);

router.get('/dashboard', getProyectosDashboard);
router.get('/', getProyectos);
router.post('/', crearProyecto);
router.get('/:id', getProyectoById);
router.put('/:id', updateProyecto);
router.delete('/:id', deleteProyecto);

export default router;