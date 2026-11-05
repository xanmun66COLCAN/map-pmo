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
  agregarSeguimiento,     
  getBitacoraProyecto,
  // 👈 1. Importa los controladores de KPIs que creamos antes
  getKpisByProyecto,
  crearKpi,
  actualizarValorKpi
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
router.get('/:id/bitacora', getBitacoraProyecto);     
router.post('/:id/bitacora', agregarSeguimiento);    

// 📌 2. AÑADE AQUÍ LAS RUTAS DE KPIS PARA QUE COINCIDAN CON EL FRONTEND
router.get('/:id/kpis', getKpisByProyecto);          // Listar KPIs del proyecto
router.post('/:id/kpis', crearKpi);                  // Crear KPI con auditoría automática
router.put('/kpis/:id', actualizarValorKpi);         // Actualizar medición del KPI

// 6. Obtener proyecto específico por ID
router.get('/:id', getProyectoById);

// 7. Actualizar proyecto completo por ID
router.put('/:id', updateProyecto);

// 8. Eliminar proyecto por ID
router.delete('/:id', deleteProyecto);

export default router;