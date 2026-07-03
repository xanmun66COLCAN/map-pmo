import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import proyectoRoutes from './routes/proyecto.routes';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api', proyectoRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba inicial
app.get('/', (req: Request, res: Response) => {
  res.send('🚀 Servidor de MAP-PMO funcionando correctamente');
});

app.listen(PORT, () => {
  console.log(`📡 Servidor corriendo en: http://localhost:5000`);
});