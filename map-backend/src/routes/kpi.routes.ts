import { Router, Request, Response } from 'express';
import pool from '../db'; // Ajusta la ruta de tu conexión a la BD

const router = Router();

// GET /api/kpis/proyecto/:id
router.get('/proyecto/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query(
      'SELECT * FROM kpis WHERE proyecto_id = $1::text',
      [id]
    );
    res.json({ success: true, data: resultado.rows });
  } catch (error) {
    console.error('Error al obtener KPIs:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// 2. Actualizar valor actual del KPI (PATCH)
router.patch('/:id/medicion', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { valor_nuevo } = req.body;

    const resultado = await pool.query(
      'UPDATE kpis SET valor_actual = $1 WHERE id::text = $2::text RETURNING *',
      [valor_nuevo, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'KPI no encontrado' });
    }

    res.json({ success: true, data: resultado.rows[0] });
  } catch (error) {
    console.error('Error al actualizar medición:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el KPI' });
  }
});

export default router;