import { Router } from 'express';
import { getDashboardKPIs } from '../controllers/dashboardController';

const router = Router();

router.get('/kpis', getDashboardKPIs);

export default router;