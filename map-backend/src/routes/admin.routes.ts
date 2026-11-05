import { Router } from 'express';
import { 
  obtenerUsuarios, 
  crearUsuarioAdmin, 
  actualizarRolUsuario, 
  obtenerAuditoria 
} from '../controllers/admin.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware'; // 👈 Corregido el nombre del archivo con punto

const router = Router();

// Todas las rutas de administración requieren autenticación y rol de Administrador (ID 1)
router.use(verificarToken, verificarRol([1]));

router.get('/usuarios', obtenerUsuarios);
router.post('/usuarios', crearUsuarioAdmin);
router.put('/usuarios/:id/rol', actualizarRolUsuario);
router.get('/auditoria', obtenerAuditoria);

export default router;