import { Request, Response } from 'express';
import { CohortController } from '../../controllers/CohortController';
import { AppDataSource } from '../../database/database';
import { Cohort } from '../../entities/models/Cohort';
import { User } from '../../entities/models/User';
import { CohortAssignment } from '../../entities/models/CohortAssignment';
import { BlacklistedStudent } from '../../entities/models/BlacklistedStudent';

jest.mock('../../database/database', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

describe('CohortController', () => {
  describe('blacklistStudent', () => {
    it('should blacklist student successfully', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { studentId: 2 };
      
      const mockBlacklist = { id: 1, student_id: 2, cohort_id: 1 };
      mockBlacklistRepository.create.mockReturnValue(mockBlacklist);
      mockBlacklistRepository.save.mockResolvedValue(mockBlacklist);

      await CohortController.blacklistStudent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockBlacklist);
      expect(mockAssignmentRepository.delete).toHaveBeenCalled();
    });
  });

  describe('getCohortById', () => {
    it('should return cohort for authorized user', async () => {
      mockRequest.params = { id: '1' };
      const mockCohort = { id: 1, name: 'Test Cohort', created_by: 1 };
      
      mockUserRepository.findOne.mockResolvedValue({ role: 'admin' });
      mockCohortRepository.findOne.mockResolvedValue(mockCohort);

      await CohortController.getCohortById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockCohort);
    });
  });
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockCohortRepository: any;
  let mockUserRepository: any;
  let mockAssignmentRepository: any;
  let mockBlacklistRepository: any;

  beforeEach(() => {
    mockRequest = {
      user: { userId: 1, role: 'admin' },
      body: { name: 'Test Cohort' },
      params: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockCohortRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn()
    };

    mockUserRepository = {
      findOne: jest.fn()
    };

    mockAssignmentRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn()
    };

    mockBlacklistRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn()
    };

    (AppDataSource.getRepository as jest.Mock)
      .mockImplementation((entity) => {
        if (entity === Cohort) return mockCohortRepository;
        if (entity === User) return mockUserRepository;
        if (entity === CohortAssignment) return mockAssignmentRepository;
        if (entity === BlacklistedStudent) return mockBlacklistRepository;
      });
  });

  describe('create', () => {
    it('should create a cohort successfully', async () => {
      const mockAdmin = { id: 1, role: 'admin' };
      const mockCohort = { id: 1, name: 'Test Cohort' };

      mockUserRepository.findOne.mockResolvedValue(mockAdmin);
      mockCohortRepository.create.mockReturnValue(mockCohort);
      mockCohortRepository.save.mockResolvedValue(mockCohort);

      await CohortController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCohort);
    });

    it('should return 403 if user is not admin', async () => {
      const mockUser = { id: 1, role: 'supervisor' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await CohortController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Seuls les administrateurs peuvent créer des cohortes"
      });
    });
  });

  describe('getCohorts', () => {
    it('should return all cohorts for admin', async () => {
      const mockCohorts = [{ id: 1, name: 'Cohort 1' }];
      mockUserRepository.findOne.mockResolvedValue({ role: 'admin' });
      mockCohortRepository.find.mockResolvedValue(mockCohorts);

      await CohortController.getCohorts(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockCohorts);
    });

    it('should return only supervisor cohorts for supervisor', async () => {
      mockRequest.user = { userId: 1, role: 'supervisor' };
      const mockCohorts = [{ id: 1, name: 'Supervisor Cohort' }];
      
      mockUserRepository.findOne.mockResolvedValue({ role: 'supervisor' });
      mockCohortRepository.find.mockResolvedValue(mockCohorts);

      await CohortController.getCohorts(mockRequest as Request, mockResponse as Response);

      expect(mockCohortRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { created_by: 1 }
        })
      );
    });
  });

  describe('assignUser', () => {
    it('should assign user to cohort successfully', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { userId: 2 };
      
      mockBlacklistRepository.findOne.mockResolvedValue(null);
      mockAssignmentRepository.findOne.mockResolvedValue(null);
      
      const mockAssignment = { id: 1, user_id: 2, cohort_id: 1 };
      mockAssignmentRepository.create.mockReturnValue(mockAssignment);
      mockAssignmentRepository.save.mockResolvedValue(mockAssignment);

      await CohortController.assignUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAssignment);
    });

    it('should return 403 if student is blacklisted', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { userId: 2 };
      
      mockBlacklistRepository.findOne.mockResolvedValue({ id: 1 });

      await CohortController.assignUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Cet étudiant est blacklisté pour cette cohorte"
      });
    });
  });

  describe('deleteCohort', () => {
    it('should delete cohort successfully', async () => {
      mockRequest.params = { id: '1' };
      mockCohortRepository.delete.mockResolvedValue({ affected: 1 });

      await CohortController.deleteCohort(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
    });

    it('should return 404 if cohort not found', async () => {
      mockRequest.params = { id: '999' };
      mockCohortRepository.delete.mockResolvedValue({ affected: 0 });

      await CohortController.deleteCohort(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Cohorte non trouvée"
      });
    });
  });
});