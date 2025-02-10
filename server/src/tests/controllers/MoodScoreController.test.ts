import { Request, Response } from 'express';
import { MoodScoreController } from '../../controllers/MoodScoreController';
import { AppDataSource } from '../../database/database';
import { MoodScore } from '../../entities/models/MoodScore';
import { MoodHistory } from '../../entities/models/MoodHistory';
import { Alert } from '../../entities/models/Alert';
import { User } from '../../entities/models/User';

jest.mock('../../database/database', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

jest.mock('../../services/emailService', () => ({
  sendAlertEmail: jest.fn()
}));

describe('MoodScoreController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockMoodScoreRepository: any;
  let mockMoodHistoryRepository: any;
  let mockAlertRepository: any;
  let mockUserRepository: any;

  beforeEach(() => {
    mockRequest = {
      user: { userId: 1, role: 'student' },
      body: { score: 75 }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockMoodScoreRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn()
    };

    mockMoodHistoryRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn()
    };

    mockAlertRepository = {
      create: jest.fn(),
      save: jest.fn()
    };

    mockUserRepository = {
      findOne: jest.fn()
    };

    (AppDataSource.getRepository as jest.Mock)
      .mockImplementation((entity) => {
        if (entity === MoodScore) return mockMoodScoreRepository;
        if (entity === MoodHistory) return mockMoodHistoryRepository;
        if (entity === Alert) return mockAlertRepository;
        if (entity === User) return mockUserRepository;
      });
  });

  describe('getMoodHistory', () => {
    it('should return mood history for admin user', async () => {
      const mockHistory = [
        { id: 1, previous_score: 80, new_score: 75 }
      ];
      mockRequest.user = { userId: 1, role: 'admin' };
      mockUserRepository.findOne.mockResolvedValue({ role: 'admin' });
      mockMoodHistoryRepository.find.mockResolvedValue(mockHistory);

      await MoodScoreController.getMoodHistory(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockHistory);
    });

    it('should deny access for non-admin users', async () => {
      mockRequest.user = { userId: 1, role: 'student' };
      mockUserRepository.findOne.mockResolvedValue({ role: 'student' });

      await MoodScoreController.getMoodHistory(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Non autorisé à voir l'historique global"
      });
    });
  });

  describe('create', () => {
    it('should create a mood score successfully', async () => {
      const mockScore = { id: 1, score: 75 };
      const mockUser = {
        cohortAssignments: [{
          cohort: {
            creator: { id: 2 }
          }
        }]
      };

      mockMoodScoreRepository.create.mockReturnValue(mockScore);
      mockMoodScoreRepository.save.mockResolvedValue(mockScore);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await MoodScoreController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockScore);
    });

    it('should return 400 for invalid score', async () => {
      mockRequest.body.score = 101;

      await MoodScoreController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Le score doit être entre 1 et 100"
      });
    });

    it('should create alert when score drops significantly', async () => {
      const lastScore = { score: 100 };
      const mockUser = {
        cohortAssignments: [{
          cohort: {
            creator: { id: 2, email: 'supervisor@test.com' }
          }
        }]
      };

      mockRequest.body.score = 60;
      mockMoodScoreRepository.findOne.mockResolvedValue(lastScore);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockMoodScoreRepository.create.mockReturnValue({ score: 60 });
      mockMoodScoreRepository.save.mockResolvedValue({ score: 60 });

      await MoodScoreController.create(mockRequest as Request, mockResponse as Response);

      expect(mockAlertRepository.create).toHaveBeenCalled();
      expect(mockAlertRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUserScores', () => {
    it('should return user scores successfully', async () => {
      const mockScores = [{ id: 1, score: 75 }];
      mockMoodScoreRepository.find.mockResolvedValue(mockScores);
      mockUserRepository.findOne.mockResolvedValue({ id: 1, role: 'student' });

      const result = await MoodScoreController.getUserScores(mockRequest as Request, mockResponse as Response);

      expect(result).toEqual(mockScores);
      expect(mockResponse.json).toHaveBeenCalledWith(mockScores);
    });

    it('should handle unauthorized access', async () => {
      mockRequest.user = undefined;

      const result = await MoodScoreController.getUserScores(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Utilisateur non authentifié"
      });
    });
  });

  describe('getStudentScores', () => {
    it('devrait retourner les scores d\'un étudiant pour un superviseur autorisé', async () => {
      const mockScores = [{ id: 1, score: 75, user: { name: 'Test Student' } }];
      const mockSupervisor = {
        role: 'supervisor',
        createdCohorts: [{
          assignments: [{ user_id: 2 }]
        }]
      };

      mockRequest.params = { studentId: '2' };
      mockRequest.user = { userId: 1, role: 'supervisor' };
      
      mockUserRepository.findOne.mockResolvedValue(mockSupervisor);
      mockMoodScoreRepository.find.mockResolvedValue(mockScores);

      await MoodScoreController.getStudentScores(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockScores);
    });

    it('devrait refuser l\'accès à un superviseur non autorisé', async () => {
      const mockSupervisor = {
        role: 'supervisor',
        createdCohorts: [{
          assignments: [{ user_id: 3 }] // Différent ID d'étudiant
        }]
      };

      mockRequest.params = { studentId: '2' };
      mockRequest.user = { userId: 1, role: 'supervisor' };
      
      mockUserRepository.findOne.mockResolvedValue(mockSupervisor);

      await MoodScoreController.getStudentScores(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Non autorisé à voir les scores de cet étudiant"
      });
    });
  });
});