import { sendAlertEmail, initializeTransporter, notifySupervisorsOfNewStudent } from '../../services/emailService';
import { AppDataSource } from '../../database/database';
import { User } from '../../entities/models/User';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');
jest.mock('../../database/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(() => ({
      findOne: jest.fn().mockResolvedValue({
        name: 'Test Student',
        email: 'student@test.com',
        cohortAssignments: [{
          cohort: {
            creator: {
              email: 'supervisor@test.com'
            }
          }
        }]
      })
    }))
  }
}));

describe('emailService', () => {
  let mockTransporter: any;

  beforeEach(() => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
      verify: jest.fn().mockResolvedValue(true)
    };
    initializeTransporter(mockTransporter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendAlertEmail', () => {
    it('should send email successfully', async () => {
      const supervisorEmail = 'supervisor@test.com';
      const studentName = 'John Doe';
      const previousScore = 90;
      const newScore = 50;

      await sendAlertEmail(supervisorEmail, studentName, previousScore, newScore);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: supervisorEmail,
          subject: expect.stringContaining(studentName),
          html: expect.stringContaining(previousScore.toString())
        })
      );
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockTransporter.sendMail.mockRejectedValue(new Error('Send failed'));

      await sendAlertEmail('test@test.com', 'Test User', 90, 50);

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  it('should handle email verification failure', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockTransporter.sendMail.mockRejectedValue(new Error('Verification failed'));

    await sendAlertEmail('test@test.com', 'Test User', 90, 50);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should handle student notification', async () => {
    const studentId = 1;
    const mockStudent = {
      name: 'Test Student',
      email: 'student@test.com',
      cohortAssignments: [{
        cohort: {
          creator: {
            email: 'supervisor@test.com'
          }
        }
      }]
    };

    await notifySupervisorsOfNewStudent(studentId);
    expect(mockTransporter.sendMail).toHaveBeenCalled();
  });
});