import { User } from '../entities/models/User';
import { AppDataSource } from '../database/database';
import { sendDailyReminder, sendNotification } from './email.service';
import * as schedule from 'node-schedule';

export class NotificationService {
  private static userRepository = AppDataSource.getRepository(User);

  // Planifier les rappels quotidiens
  static async scheduleDailyReminders() {
    // Exécuter tous les jours à 10h
    schedule.scheduleJob('0 10 * * *', async () => {
      try {
        // Récupérer tous les utilisateurs avec rappels activés
        const users = await this.userRepository.find({
          where: {
            preferences: {
              dailyReminders: true
            }
          }
        });

        // Envoyer les rappels
        for (const user of users) {
          await sendDailyReminder(user);
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi des rappels:', error);
      }
    });
  }

  // Envoyer une notification par email
  static async sendEmailNotification(userId: number, subject: string, message: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (user && user.preferences?.emailNotifications) {
        await sendNotification(user, subject, message);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
    }
  }
}