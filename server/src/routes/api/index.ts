import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import cohortRoutes from './cohort.routes';
import moodRoutes from './mood.routes';
import alertRoutes from './alert.routes';

const router = Router();

// Configuration des routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cohorts', cohortRoutes);
router.use('/moods', moodRoutes);
router.use('/alerts', alertRoutes);

export default router;