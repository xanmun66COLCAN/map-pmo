import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import proyectoRoutes from './routes/proyecto.routes';

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// 🟢 1. Rutas de Autenticación (PÚBLICAS - Permiten iniciar sesión)
app.use('/api/auth', authRoutes);

// 🔒 2. Rutas de la API de Proyectos (PROTEGIDAS - Requieren Token)
app.use('/api', proyectoRoutes);

// Ruta de prueba inicial para verificar el estado del servidor
app.get('/', (req: Request, res: Response) => {
  res.send('🚀 Servidor de MAP-PMO funcionando correctamente');
});

// Inicialización del servidor
app.listen(PORT, () => {
  console.log(`📡 Servidor corriendo en: http://localhost:${PORT}`);
});