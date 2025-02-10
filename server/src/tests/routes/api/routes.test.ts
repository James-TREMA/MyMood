import request from 'supertest';
import express from 'express';
import apiRoutes from '../../../routes/api';
import { UserController } from '../../../controllers/UserController';
import { MoodScoreController } from '../../../controllers/MoodScoreController';
import { CohortController } from '../../../controllers/CohortController';
import { AlertController } from '../../../controllers/AlertController';
import { Request, Response, NextFunction } from 'express';

// Mock des contrôleurs
jest.mock('../../../controllers/UserController');
jest.mock('../../../controllers/MoodScoreController');
jest.mock('../../../controllers/CohortController');
jest.mock('../../../controllers/AlertController');

// Mock du middleware d'authentification
jest.mock('../../../middleware/auth', () => ({
  authenticate: jest.fn((_req: Request, _res: Response, next: NextFunction) => {
    _req.user = { userId: 1, role: 'student' };
    next();
  }),
  checkRole: jest.fn(() => (_req: Request, _res: Response, next: NextFunction) => {
    next();
  })
}));

describe('API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', apiRoutes);

    // Reset des mocks
    jest.clearAllMocks();
  });

  describe('Auth Routes', () => {
    beforeEach(() => {
      (UserController.register as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({ message: 'User registered' });
      });
      (UserController.login as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ token: 'test-token' });
      });
    });

    it('should handle POST /api/auth/register', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'student'
        });

      expect(response.status).toBe(201);
      expect(UserController.register).toHaveBeenCalled();
    });

    it('should handle POST /api/auth/login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(UserController.login).toHaveBeenCalled();
    });
  });

  describe('Mood Routes', () => {
    beforeEach(() => {
      (MoodScoreController.create as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({ score: req.body.score });
      });
      (MoodScoreController.getUserScores as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json([{ score: 75 }]);
      });
    });

    it('should handle POST /api/moods', async () => {
      const response = await request(app)
        .post('/api/moods')
        .set('Authorization', 'Bearer test-token')
        .send({ score: 75 });

      expect(response.status).toBe(201);
      expect(MoodScoreController.create).toHaveBeenCalled();
    });

    it('should handle GET /api/moods/me', async () => {
      const response = await request(app)
        .get('/api/moods/me')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(MoodScoreController.getUserScores).toHaveBeenCalled();
    });
  });

  describe('Cohort Routes', () => {
    beforeEach(() => {
      (CohortController.getCohorts as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json([{ id: 1, name: 'Test Cohort' }]);
      });
      (CohortController.create as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({ id: 1, name: req.body.name });
      });
    });

    it('should handle GET /api/cohorts', async () => {
      const response = await request(app)
        .get('/api/cohorts')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(CohortController.getCohorts).toHaveBeenCalled();
    });

    it('should handle POST /api/cohorts', async () => {
      const response = await request(app)
        .post('/api/cohorts')
        .set('Authorization', 'Bearer test-token')
        .send({ name: 'New Cohort' });

      expect(response.status).toBe(201);
      expect(CohortController.create).toHaveBeenCalled();
    });
  });

  describe('Alert Routes', () => {
    beforeEach(() => {
      (AlertController.createAlert as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({ id: 1, status: 'pending' });
      });
      (AlertController.getAlerts as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json([{ id: 1, status: 'pending' }]);
      });
    });

    it('should handle POST /api/alerts', async () => {
      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(201);
      expect(AlertController.createAlert).toHaveBeenCalled();
    });

    it('should handle GET /api/alerts', async () => {
      const response = await request(app)
        .get('/api/alerts')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(AlertController.getAlerts).toHaveBeenCalled();
    });
  });
});