import { Router } from 'express';
import apiRoutes from './api';

const router = Router();

// Montage des routes API
router.use('/api', apiRoutes);

export default router;