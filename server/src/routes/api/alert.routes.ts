import { Router } from 'express';
import { AlertController } from '../../controllers/AlertController';
import { authenticate, checkRole } from '../../middleware/auth';

const router = Router();

// Routes pour les étudiants
router.post('/', authenticate, AlertController.createAlert);
router.get('/me', authenticate, AlertController.getStudentAlerts);

// Routes pour superviseurs et admins
router.get('/', authenticate, checkRole(['supervisor', 'admin']), AlertController.getAlerts);
router.put('/:id/resolve', authenticate, checkRole(['supervisor', 'admin']), AlertController.resolveAlert);
router.delete('/:id', authenticate, checkRole(['admin']), AlertController.deleteAlert);

export default router;