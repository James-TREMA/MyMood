import { Request, Response } from 'express';
import { AlertController } from '../../controllers/AlertController';
import { AppDataSource } from '../../database/database';
import { Alert } from '../../entities/models/Alert';
import { User } from '../../entities/models/User';

jest.mock('../../database/database', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

describe('AlertController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockAlertRepository: any;
  let mockUserRepository: any;

  beforeEach(() => {
    mockRequest = {
      user: { userId: 1, role: 'student' },
      params: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockAlertRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn()
    };

    mockUserRepository = {
      findOne: jest.fn()
    };

    (AppDataSource.getRepository as jest.Mock)
      .mockImplementation((entity) => {
        if (entity === Alert) return mockAlertRepository;
        if (entity === User) return mockUserRepository;
      });
  });

  describe('createAlert', () => {
    it('should create an alert successfully', async () => {
      const mockUser = {
        id: 1,
        cohortAssignments: [{
          cohort: {
            creator: { id: 2 }
          }
        }]
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockAlertRepository.create.mockReturnValue({ id: 1 });
      mockAlertRepository.save.mockResolvedValue({ id: 1 });

      await AlertController.createAlert(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return 400 if user has no supervisor', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, cohortAssignments: [] });

      await AlertController.createAlert(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Impossible de créer l'alerte: pas de superviseur assigné"
      });
    });
  });

  describe('getAlerts', () => {
    it('should return alerts for admin user', async () => {
      const mockUser = { id: 1, role: 'admin' };
      const mockAlerts = [{ id: 1 }, { id: 2 }];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockAlertRepository.find.mockResolvedValue(mockAlerts);

      await AlertController.getAlerts(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockAlerts);
    });

    it('should return 403 for student user', async () => {
      const mockUser = { id: 1, role: 'student' };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await AlertController.getAlerts(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Non autorisé à voir les alertes"
      });
    });
  });

  describe('resolveAlert', () => {
    it('should resolve alert successfully', async () => {
      const mockUser = { id: 1, role: 'supervisor' };
      const mockAlert = {
        id: 1, 
        supervisor_id: 1,
        status: 'pending'
      };

      mockRequest.params = { id: '1' };
      mockRequest.user = { userId: 1, role: 'supervisor' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockAlertRepository.findOne.mockResolvedValue(mockAlert);
      mockAlertRepository.save.mockResolvedValue({ ...mockAlert, status: 'resolved' });

      await AlertController.resolveAlert(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'resolved'
      }));
    });

    it('should return 403 if user is not authorized', async () => {
      const mockUser = { id: 2, role: 'supervisor' };
      const mockAlert = { 
        id: 1, 
        supervisor_id: 1,
        status: 'pending'
      };

      mockRequest.params = { id: '1' };
      mockRequest.user = { userId: 2, role: 'supervisor' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockAlertRepository.findOne.mockResolvedValue(mockAlert);

      await AlertController.resolveAlert(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Non autorisé à résoudre cette alerte"
      });
    });
  });
});