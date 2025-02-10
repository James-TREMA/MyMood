import nodemailer from 'nodemailer';
import { User } from '../entities/models/User';
import { AppDataSource } from '../database/database';

let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export function initializeTransporter(customTransporter?: any) {
  if (customTransporter) {
    transporter = customTransporter;
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}

async function sendDailyReminder(user: User) {
  if (user.preferences?.dailyReminders) {
    await sendEmail(
      user.email,
      'Rappel MyMood',
      'N\'oubliez pas d\'enregistrer votre humeur aujourd\'hui !'
    );
  }
}

async function sendNotification(user: User, subject: string, message: string) {
  if (user.preferences?.emailNotifications) {
    await sendEmail(user.email, subject, message);
  }
}

export async function sendAlertEmail(
  supervisorEmail: string,
  studentName: string,
  previousScore: number,
  newScore: number
) {
  const subject = `Alerte - Baisse d'humeur significative pour ${studentName}`;
  const html = `
    <h2>Alerte de baisse d'humeur</h2>
    <p>L'étudiant ${studentName} a enregistré une baisse significative de son humeur.</p>
    <p>Score précédent: ${previousScore}</p>
    <p>Nouveau score: ${newScore}</p>
    <p>Une intervention pourrait être nécessaire.</p>
  `;

  await sendEmail(supervisorEmail, subject, html);
}

export { sendEmail, sendDailyReminder, sendNotification };