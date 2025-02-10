import { Router } from 'express';
import { MoodScoreController } from '../../controllers/MoodScoreController';
import { authenticate, checkRole } from '../../middleware/auth';
import { validateMoodScore } from '../../middleware/validation';

const router = Router();

// Routes pour les étudiants
router.post('/', authenticate, validateMoodScore, MoodScoreController.create);
router.get('/me', authenticate, MoodScoreController.getUserScores);
// Routes pour superviseurs et admins
router.get('/student/:id', authenticate, checkRole(['supervisor', 'admin']), MoodScoreController.getStudentScores);
router.get('/history', authenticate, checkRole(['admin']), MoodScoreController.getMoodHistory);

export default router;