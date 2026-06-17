const express = require('express');
const cors = require('cors');
require('dotenv').config();


const pool = require('./config/db');

// IMPORTACIÓN: Traemos el archivo de rutas de autenticación
const authRoutes = require('./routes/authRoutes');
const iniciativaRoutes = require('./routes/iniciativaRoutes'); // <-- AGREGA ESTA

const app = express();

app.use(cors());
app.use(express.json());

// VINCULACIÓN: Le decimos a Express que todas las rutas de authRoutes comiencen con /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/iniciativas', iniciativaRoutes); // <-- AGREGA ESTA

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

require('dotenv').config()