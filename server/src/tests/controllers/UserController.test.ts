import { Request, Response } from 'express';
import { UserController } from '../../controllers/UserController';
import { AppDataSource } from '../../database/database';
import { User } from '../../entities/models/User';
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true)
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock_token')
}));

jest.mock('../../database/database', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserRepository: any;

  beforeEach(() => {
    mockRequest = {
      user: { userId: 1, role: 'admin' },
      body: {},
      params: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn()
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student'
      };
      mockRequest.body = registerData;
      
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ id: 1, ...registerData });
      mockUserRepository.save.mockResolvedValue({ id: 1, ...registerData });

      await UserController.register(mockRequest as Request, mockResponse as Response);

      expect(hash).toHaveBeenCalledWith('password123', 10);
      expect(sign).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ email: registerData.email }),
          token: expect.any(String)
        })
      );
    });

    it('should return 400 if email already exists', async () => {
      mockRequest.body = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'student'
      };
      
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });

      await UserController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Cet email est déjà utilisé"
      });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      mockRequest.body = loginData;

      const mockUser = {
        id: 1,
        email: loginData.email,
        password: 'hashed_password'
      };
      
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await UserController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ email: loginData.email }),
          token: expect.any(String)
        })
      );
    });

    it('should return 401 with invalid credentials', async () => {
      mockRequest.body = {
        email: 'wrong@example.com',
        password: 'wrongpass'
      };
      
      mockUserRepository.findOne.mockResolvedValue(null);

      await UserController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Email ou mot de passe incorrect"
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'student'
      };
      
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await UserController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockUser.name,
          email: mockUser.email
        })
      );
    });

    it('should return 404 if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await UserController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Utilisateur non trouvé"
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ];
      
      mockUserRepository.find.mockResolvedValue(mockUsers);

      await UserController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'User 1' }),
          expect.objectContaining({ name: 'User 2' })
        ])
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockRequest.params = { id: '1' };
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      await UserController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: '999' };
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });

      await UserController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Utilisateur non trouvé"
      });
    });
  });

  describe('updateUser', () => {
    it('devrait mettre à jour les informations de l\'utilisateur avec succès', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'student'
      };
      
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };
      
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, ...mockRequest.body });

      await UserController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Name',
          email: 'updated@example.com'
        })
      );
    });

    it('devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
      mockRequest.params = { id: '999' };
      mockUserRepository.findOne.mockResolvedValue(null);

      await UserController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Utilisateur non trouvé"
      });
    });
  });
});