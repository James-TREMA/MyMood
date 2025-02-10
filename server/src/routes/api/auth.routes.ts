import { Router } from 'express';
import { UserController } from '../../controllers/UserController';
import { validateAuth } from '../../middleware/validation';

const router = Router();

// Route d'enregistrement publique pour le premier admin
router.post('/register', validateAuth, UserController.register);
router.post('/login', validateAuth, UserController.login);

export default router;