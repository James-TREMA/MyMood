import { Request, Response, NextFunction } from 'express';
import { authenticate, checkRole } from '../../middleware/auth';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('authenticate', () => {
    it('should authenticate valid token', () => {
      const mockUser = { userId: 1, role: 'admin' };
      mockRequest.headers = {
        authorization: 'Bearer valid_token'
      };
      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toEqual(mockUser);
    });

    it('should return 401 when no token provided', () => {
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Authentification requise'
      });
    });

    it('should return 401 for invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid_token'
      };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token invalide'
      });
    });
  });

  describe('checkRole', () => {
    it('should allow access for correct role', () => {
      mockRequest.user = { userId: 1, role: 'admin' };
      const middleware = checkRole(['admin']);

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should deny access for incorrect role', () => {
      mockRequest.user = { userId: 1, role: 'student' };
      const middleware = checkRole(['admin']);

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Accès non autorisé'
      });
    });

    it('should return 401 when no user in request', () => {
      const middleware = checkRole(['admin']);

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Authentification requise'
      });
    });
  });
});