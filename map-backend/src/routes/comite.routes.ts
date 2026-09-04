import { Router } from 'express';
import { agendarComite } from '../controllers/comites.controller';

const router = Router();

router.post('/', agendarComite);

export default router;

