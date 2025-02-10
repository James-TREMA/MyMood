import { Request, Response, NextFunction } from 'express';
import { validateAuth, validateMoodScore } from '../../middleware/validation';
import { validationResult } from 'express-validator';

// Mock express-validator avec des chaînes de validation
jest.mock('express-validator', () => ({
  body: jest.fn().mockReturnValue({
    isEmail: jest.fn().mockReturnValue({
      withMessage: jest.fn().mockReturnValue((req: Request, res: Response, next: NextFunction) => next())
    }),
    isLength: jest.fn().mockReturnValue({
      withMessage: jest.fn().mockReturnValue((req: Request, res: Response, next: NextFunction) => next())
    }),
    isInt: jest.fn().mockReturnValue({
      withMessage: jest.fn().mockReturnValue((req: Request, res: Response, next: NextFunction) => next())
    })
  }),
  validationResult: jest.fn()
}));

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  let mockValidationResult: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
    mockValidationResult = validationResult as unknown as jest.Mock;
    mockValidationResult.mockReset();
  });

  describe('validateAuth', () => {
    it('should pass valid auth data', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      await validateAuth[validateAuth.length - 1](mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should fail with invalid email', async () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: 'password123'
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{
          param: 'email',
          msg: 'Email invalide'
        }]
      });

      await validateAuth[validateAuth.length - 1](mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([
          expect.objectContaining({
            param: 'email',
            msg: 'Email invalide'
          })
        ])
      });
    });

    it('should fail with short password', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: '12345'
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{
          param: 'password',
          msg: 'Le mot de passe doit contenir au moins 6 caractères'
        }]
      });

      await validateAuth[validateAuth.length - 1](mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([
          expect.objectContaining({
            param: 'password',
            msg: 'Le mot de passe doit contenir au moins 6 caractères'
          })
        ])
      });
    });
  });

  describe('validateMoodScore', () => {
    it('should pass valid mood score', async () => {
      mockRequest.body = {
        score: 75
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      await validateMoodScore[validateMoodScore.length - 1](mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should fail with score below minimum', async () => {
      mockRequest.body = {
        score: 0
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{
          param: 'score',
          msg: 'Le score doit être entre 1 et 100'
        }]
      });

      await validateMoodScore[validateMoodScore.length - 1](mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([
          expect.objectContaining({
            param: 'score',
            msg: 'Le score doit être entre 1 et 100'
          })
        ])
      });
    });

    it('should fail with score above maximum', async () => {
      mockRequest.body = {
        score: 101
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{
          param: 'score',
          msg: 'Le score doit être entre 1 et 100'
        }]
      });

      await validateMoodScore[validateMoodScore.length - 1](mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([
          expect.objectContaining({
            param: 'score',
            msg: 'Le score doit être entre 1 et 100'
          })
        ])
      });
    });
  });
});