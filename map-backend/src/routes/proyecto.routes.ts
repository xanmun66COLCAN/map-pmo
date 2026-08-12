import { Router } from 'express';
import { 
  getProyectosDashboard, 
  getProyectos, // 👈 Agregar import para listar todos los proyectos
  crearProyecto, 
  getProyectoById,
  updateProyecto,
  deleteProyecto
} from '../controllers/proyecto.controller'; 
import verificarToken from '../middlewares/auth.middleware';

const router = Router();

// 🔒 Todas las rutas de proyectos requieren token JWT
router.use(verificarToken);

// 1. Dashboard (debe ir antes de /:id para evitar colisión de rutas)
router.get('/dashboard', getProyectosDashboard);

// 2. Listar todos los proyectos
router.get('/', getProyectos);

// 3. Crear proyecto
router.post('/', crearProyecto);

// 4. Obtener proyecto específico por ID
router.get('/:id', getProyectoById);

// 5. Actualizar proyecto por ID
router.put('/:id', updateProyecto);

// 6. Eliminar proyecto por ID
router.delete('/:id', deleteProyecto);

export default router;