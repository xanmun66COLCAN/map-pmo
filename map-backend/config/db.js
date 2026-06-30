// db.js
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Inicializamos el cliente de Prisma
const pool = new PrismaClient();

// Verificación de conexión nativa de Prisma
pool.$connect()
    .then(() => {
        console.log('✅ Conexión interna a PostgreSQL exitosa a través de Prisma.');
    })
    .catch((err) => {
        console.error('❌ Error al conectar con PostgreSQL desde db.js con Prisma:', err);
    });

// Exportamos 'pool' con la instancia de Prisma para no romper los 'require' en tus otros archivos
module.exports = pool;