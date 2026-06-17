const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verificarToken = require('./authMiddleware');

// RUTA PARA CREAR INICIATIVA: POST /api/iniciativas
router.post('/', verificarToken, async (req, res) => {
    const { titulo, descripcion, impacto_estimado, costo_estimado, riesgo_estimado, alineacion_estrategica } = req.body;
    const id_creador = req.usuario.id; // Lo saca del token automáticamente

    try {
        if (!titulo || !descripcion || !impacto_estimado || !costo_estimado || !riesgo_estimado || !alineacion_estrategica) {
            return res.status(400).json({ error: "Todos los campos son obligatorios." });
        }

        // --- ALGORITMO DE PRIORIZACIÓN ---
        const impacto = parseInt(impacto_estimado);
        const alineacion = parseInt(alineacion_estrategica);
        const riesgo = parseInt(riesgo_estimado);
        const riesgoMitigado = 6 - riesgo; 

        // Fórmula matemática automatizada
        const score_calculado = ((impacto + alineacion + riesgoMitigado) / 3).toFixed(2);

        const nuevaIniciativa = await pool.query(
            `INSERT INTO iniciativas 
            (titulo, descripcion, impacto_estimado, costo_estimado, riesgo_estimado, alineacion_estrategica, score_final, id_creador) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [titulo, descripcion, impacto, costo_estimado, riesgo, alineacion, score_calculado, id_creador]
        );

        res.status(201).json({
            mensaje: "Iniciativa registrada y priorizada con éxito.",
            iniciativa: nuevaIniciativa.rows[0]
        });

    } catch (error) {
        console.error("Error al crear iniciativa:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// RUTA PARA LISTAR INICIATIVAS: GET /api/iniciativas
router.get('/', async (req, res) => {
    try {
        const listado = await pool.query(
            `SELECT i.*, u.nombre as creador 
             FROM iniciativas i 
             JOIN usuarios u ON i.id_creador = u.id 
             ORDER BY i.score_final DESC`
        );
        res.json(listado.rows);
    } catch (error) {
        console.error("Error al listar iniciativas:", error);
        res.status(500).json({ error: "Error al obtener las iniciativas." });
    }
});

// ==========================================================
// RUTA 3: ACTUALIZAR ESTADO Y CICLO DE VIDA (PUT /api/iniciativas/:id/estado)
// Protegida con token. Valida roles y lecciones aprendidas obligatorias.
// ==========================================================
router.put('/:id/estado', verificarToken, async (req, res) => {
    const { id } = req.params; // El ID de la iniciativa que viene en la URL
    const { nuevo_estado, lecciones_aprendidas } = req.body;
    const { id_rol } = req.usuario; // Extraído de forma segura de tu Token JWT

    try {
        // --- REGLA DE NEGOCIO 1: CONTROL DE ACCESO (RBAC) ---
        // Supongamos que: Rol 1 = Analista, Rol 2 = Comité Evaluador, Rol 3 = Gerente PMO
        // El Analista (Rol 1) NO tiene permiso de cambiar estados de ciclo de vida.
        if (id_rol === 1) {
            return res.status(403).json({ 
                error: "Acceso denegado. Los Analistas de Innovación no tienen permisos para alterar el estado de las iniciativas." 
            });
        }

        // Validar que nos envíen el estado al que quieren cambiar
        if (!nuevo_estado) {
            return res.status(400).json({ error: "El campo 'nuevo_estado' es obligatorio." });
        }

        // --- REGLA DE NEGOCIO 2: LECCIONES APRENDIDAS OBLIGATORIAS ---
        // Si el estado final es de cierre, obligamos a que se documente el aprendizaje
        const estadosDeCierre = ["Finalizado", "Cancelado", "Cerrado"];
        if (estadosDeCierre.includes(nuevo_estado) && (!lecciones_aprendidas || lecciones_aprendidas.trim() === "")) {
            return res.status(400).json({ 
                error: `Regla de Negocio PMO: Para mover el proyecto al estado '${nuevo_estado}', es obligatorio registrar las lecciones aprendidas para el histórico organizacional.` 
            });
        }

        // Verificar primero si la iniciativa existe en PostgreSQL
        const iniciativaExiste = await pool.query('SELECT * FROM iniciativas WHERE id = $1', [id]);
        if (iniciativaExiste.rows.length === 0) {
            return res.status(404).json({ error: "La iniciativa especificada no existe." });
        }

        // Ejecutar la actualización en la Base de Datos
        // Usamos COALESCE para que si 'lecciones_aprendidas' no viene (en estados intermedios), mantenga lo que tenía o quede en null.
        const actualizacion = await pool.query(
            `UPDATE iniciativas 
             SET estado = $1, 
                 lecciones_aprendidas = COALESCE($2, lecciones_aprendidas), 
                 fecha_actualizacion = CURRENT_TIMESTAMP 
             WHERE id = $3 
             RETURNING *`,
            [nuevo_estado, lecciones_aprendidas || null, id]
        );

        res.json({
            mensaje: `Ciclo de vida actualizado con éxito a fase: ${nuevo_estado}`,
            iniciativa: actualizacion.rows[0]
        });

    } catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({ error: "Error interno del servidor al procesar el ciclo de vida." });
    }
});

module.exports = router;