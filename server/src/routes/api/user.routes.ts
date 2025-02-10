import { Router } from 'express';
import { UserController } from '../../controllers/UserController';
import { authenticate, checkRole } from '../../middleware/auth';

const router = Router();

router.get('/profile', authenticate, UserController.getProfile);
router.get('/preferences', authenticate, UserController.getPreferences);
router.put('/preferences', authenticate, UserController.updatePreferences);
router.get('/', authenticate, checkRole(['admin']), UserController.getAllUsers);
router.post('/', authenticate, checkRole(['admin']), UserController.createUser);
router.put('/:id', authenticate, checkRole(['admin']), UserController.updateUser);
router.delete('/:id', authenticate, checkRole(['admin']), UserController.deleteUser);

export default router;