import { Router } from 'express';
import { 
    agendarComite, 
    obtenerComitesPorProyecto, 
    actualizarComite // 👈 1. Asegúrate de importar la función de actualización
} from '../controllers/comites.controller';
import verificarToken from '../middlewares/auth.middleware'; // O la ruta donde tengas tu middleware

const router = Router();

// Redirige GET /api/comites al controlador de comités
router.get('/', obtenerComitesPorProyecto);

// Ruta para crear/agendar un comité (POST)
router.post('/', agendarComite);

// Ruta para obtener el histórico de comités de un proyecto específico (GET)
router.get('/proyecto/:idProyecto', obtenerComitesPorProyecto);

// 🟢 2. Agrega esta línea para permitir la reprogramación por ID
router.put('/:id', verificarToken, actualizarComite);

router.post('/proyecto/:idProyecto', agendarComite);

export default router;