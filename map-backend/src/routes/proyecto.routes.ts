import { Router } from 'express';
import { 
  getProyectosDashboard, 
  getProyectos, 
  crearProyecto, 
  getProyectoById,
  updateProyecto,
  deleteProyecto,
  actualizarEstadoIniciativa,
  getLogsAuditoria,
  actualizarEvaluacionMulticriterio
} from '../controllers/proyecto.controller'; 
import verificarToken from '../middlewares/auth.middleware';

const router = Router();

// 🔒 Todas las rutas de proyectos requieren token JWT
router.use(verificarToken);

// 1. Dashboard (debe ir antes de /:id)
router.get('/dashboard', getProyectosDashboard);

// 2. Listar todos los proyectos
router.get('/', getProyectos);

// 3. Crear proyecto
router.post('/', crearProyecto);

// 4. Ruta para la auditoría
router.get('/auditoria/logs', getLogsAuditoria);

// 5. MOVER AQUÍ: Las rutas específicas con subniveles van ANTES de /:id
router.patch('/:id/estado', actualizarEstadoIniciativa);

// 6. Nueva ruta para la Calificación Multicriterio
router.put('/:id/evaluacion', actualizarEvaluacionMulticriterio);

// 7. Obtener proyecto específico por ID
router.get('/:id', getProyectoById);

// 8. Actualizar proyecto completo por ID
router.put('/:id', updateProyecto);

// 9. Eliminar proyecto por ID
router.delete('/:id', deleteProyecto);

export default router;