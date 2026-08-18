import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import proyectoRoutes from './routes/proyecto.routes';
import dashboardRoutes from './routes/dashboardRoutes';
import adminRoutes from './routes/admin.routes'; // 👈 1. Importa las rutas de administración

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// 🟢 1. Rutas de Autenticación (PÚBLICAS)
app.use('/api/auth', authRoutes);

// 🔒 2. Rutas de la API de Proyectos (PROTEGIDAS)
app.use('/api/proyectos', proyectoRoutes);

// 📊 3. Rutas del Dashboard
app.use('/api/dashboard', dashboardRoutes);

// 🛡️ 4. Rutas de Administración (PROTEGIDAS por rol ADMIN)
app.use('/api/admin', adminRoutes); // 👈 2. Monta las rutas de admin aquí

// Ruta de prueba inicial para verificar el estado del servidor
app.get('/', (req: Request, res: Response) => {
  res.send('🚀 Servidor de MAP-PMO funcionando correctamente');
});

// Inicialización del servidor (DEBE IR SIEMPRE AL FINAL)
app.listen(PORT, () => {
  console.log(`📡 Servidor corriendo en: http://localhost:${PORT}`);
});