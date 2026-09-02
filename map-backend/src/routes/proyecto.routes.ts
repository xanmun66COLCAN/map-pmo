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
  actualizarEvaluacionMulticriterio,
  agregarSeguimiento,     // 👈 Nuevo controlador de bitácora
  getBitacoraProyecto     // 👈 Nuevo controlador de bitácora
} from '../controllers/proyecto.controller'; 
import verificarToken from '../middlewares/auth.middleware';

const router = Router();

// 🔒 Todas las rutas de proyectos requieren token JWT
router.use(verificarToken);

// 1. Dashboard (debe ir antes de /:id)
router.get('/dashboard', getProyectosDashboard);

// 2. Ruta para la auditoría (debe ir antes de /:id para evitar conflictos)
router.get('/auditoria/logs', getLogsAuditoria);

// 3. Listar todos los proyectos
router.get('/', getProyectos);

// 4. Crear proyecto
router.post('/', crearProyecto);

// 5. Rutas específicas con subniveles (van ANTES de /:id)
router.patch('/:id/estado', actualizarEstadoIniciativa);
router.put('/:id/evaluacion', actualizarEvaluacionMulticriterio);

// 📌 Rutas de Bitácora de Seguimiento Ejecutivo
router.get('/:id/bitacora', getBitacoraProyecto);     // Obtener historial de bitácora
router.post('/:id/bitacora', agregarSeguimiento);    // Crear un nuevo registro en la bitácora

// 6. Obtener proyecto específico por ID
router.get('/:id', getProyectoById);

// 7. Actualizar proyecto completo por ID
router.put('/:id', updateProyecto);

// 8. Eliminar proyecto por ID
router.delete('/:id', deleteProyecto);

export default router;