import { Router } from 'express';
import { CohortController } from '../../controllers/CohortController';
import { authenticate, checkRole } from '../../middleware/auth';

const router = Router();

// Routes accessibles aux superviseurs et admins
router.get('/', authenticate, checkRole(['supervisor', 'admin']), CohortController.getCohorts);
router.get('/:id', authenticate, checkRole(['supervisor', 'admin']), CohortController.getCohortById);

// Routes accessibles uniquement aux admins
router.post('/', authenticate, checkRole(['admin']), CohortController.create);
router.post('/:id/assign', authenticate, checkRole(['admin']), CohortController.assignUser);
router.delete('/:cohortId/assignments/:studentId', authenticate, checkRole(['admin', 'supervisor']), CohortController.removeStudent);
router.post('/:id/blacklist', authenticate, checkRole(['admin']), CohortController.blacklistStudent);
router.delete('/:id', authenticate, checkRole(['admin']), CohortController.deleteCohort);

export default router;