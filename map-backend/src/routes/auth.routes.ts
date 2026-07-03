import { Router, Request, Response } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  res.json({ ok: true, mensaje: "Conectado desde MAP backend" });
});

export default router;