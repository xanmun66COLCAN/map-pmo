import { Router } from 'express';
import { getProyectosDashboard, createProyecto } from '../controllers/proyecto.controller'; 
import verificarToken from '../authMiddleware'; // 👈 Ruta corregida apuntando a la raíz de src

const router = Router();

// 🔒 Shield protector activado globalmente en este archivo
router.use(verificarToken);

// Endpoints protegidos
router.get('/dashboard', getProyectosDashboard);
router.post('/proyectos', createProyecto);

export default router;