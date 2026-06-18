const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

// IMPORTACIÓN: Traemos los archivos de rutas
const authRoutes = require('./routes/authRoutes');
const iniciativaRoutes = require('./routes/iniciativaRoutes');

const app = express();

// CONFIGURACIÓN DE CORS: Modificada para darle acceso seguro a tu Frontend de Vite
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// VINCULACIÓN: Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/iniciativas', iniciativaRoutes);

// Ruta de estado general
app.get('/api/status', async (req, res) => {
    try {
        const dbResult = await pool.query('SELECT NOW()');
        res.json({ 
            proyecto: "MAP - Management & Analysis Platform",
            estado: "Servidor Backend operando con éxito",
            base_de_datos: "Conectada correctamente",
            hora_servidor_db: dbResult.rows[0].now
        });
    } catch (error) {
        console.error("❌ Error en DB:", error);
        res.status(500).json({ error: "Error de comunicación con PostgreSQL" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` Servidor de MAP corriendo con éxito en el puerto ${PORT}`);
    console.log(`==================================================`);
});