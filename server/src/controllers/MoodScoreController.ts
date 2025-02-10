import { Request, Response } from "express";
import { AppDataSource } from "../database/database";
import { MoodScore } from "../entities/models/MoodScore";
import { MoodHistory } from "../entities/models/MoodHistory";
import { Alert } from "../entities/models/Alert";
import { User } from "../entities/models/User";
import { sendAlertEmail } from "../services/email.service";

const initializeRepositories = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return {
    moodScoreRepository: AppDataSource.getRepository(MoodScore),
    moodHistoryRepository: AppDataSource.getRepository(MoodHistory),
    alertRepository: AppDataSource.getRepository(Alert),
    userRepository: AppDataSource.getRepository(User)
  };
};

export class MoodScoreController {
  static async create(req: Request, res: Response) {
    try {
      const { score } = req.body;
      const userId = req.user?.userId;
      const repositories = await initializeRepositories();

      if (score < 1 || score > 100) {
        return res.status(400).json({ message: "Le score doit être entre 1 et 100" });
      }

      // Récupérer le dernier score
      const lastScore = await repositories.moodScoreRepository.findOne({
        where: { user_id: userId },
        order: { created_at: "DESC" },
      });

      // Créer le nouveau score
      const moodScore = repositories.moodScoreRepository.create({
        user_id: userId,
        score,
      });
      await repositories.moodScoreRepository.save(moodScore);

      // Enregistrer l'historique si un score précédent existe
      if (lastScore) {
        const history = repositories.moodHistoryRepository.create({
          user_id: userId,
          previous_score: lastScore.score,
          new_score: score,
        });
        await repositories.moodHistoryRepository.save(history);

        // Créer une alerte si le score a baissé significativement
        if (lastScore.score - score > 30) {
          const user = await repositories.userRepository.findOne({
            where: { id: userId },
            relations: ["cohortAssignments.cohort.creator"]
          });

          if (user && user.cohortAssignments[0]?.cohort?.creator) {
            const alert = repositories.alertRepository.create({
              user_id: userId,
              supervisor_id: user.cohortAssignments[0].cohort.creator.id,
              status: "pending",
            });
            await repositories.alertRepository.save(alert);

            // Envoyer un email au superviseur
            await sendAlertEmail(
              user.cohortAssignments[0].cohort.creator.email,
              user.name,
              lastScore.score,
              score
            );
          }
        }
      }

      return res.status(201).json(moodScore);
    } catch (error) {
      console.error('Error creating mood score:', error);
      return res.status(500).json({ message: "Erreur lors de l'enregistrement du score" });
    }
  }

  static async getUserScores(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const repositories = await initializeRepositories();
      
      if (!userId) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }

      const scores = await repositories.moodScoreRepository.find({
        where: { user_id: userId },
        order: { created_at: "DESC" },
        take: 30
      });

      return res.json(scores);
    } catch (error) {
      console.error('Error in getUserScores:', error);
      return res.status(500).json({ message: "Erreur lors de la récupération des scores" });
    }
  }

  static async getStudentScores(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const supervisorId = req.user?.userId;
      const repositories = await initializeRepositories();

      const supervisor = await repositories.userRepository.findOne({
        where: { id: supervisorId },
        relations: ["createdCohorts.assignments.user"]
      });

      if (!supervisor || supervisor.role === 'student') {
        return res.status(403).json({ message: "Non autorisé à voir les scores" });
      }

      const hasAccess = supervisor.createdCohorts.some(cohort =>
        cohort.assignments.some(assignment => assignment.user_id === parseInt(studentId))
      );

      if (!hasAccess && supervisor.role !== 'admin') {
        return res.status(403).json({ message: "Non autorisé à voir les scores de cet étudiant" });
      }

      const scores = await repositories.moodScoreRepository.find({
        where: { user_id: parseInt(studentId) },
        order: { created_at: "DESC" },
        relations: ["user"]
      });

      return res.json(scores);
    } catch (error) {
      console.error('Error getting student scores:', error);
      return res.status(500).json({ message: "Erreur lors de la récupération des scores" });
    }
  }

  static async getMoodHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const repositories = await initializeRepositories();

      const user = await repositories.userRepository.findOne({ 
        where: { id: userId } 
      });

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Non autorisé à voir l'historique global" });
      }

      const history = await repositories.moodHistoryRepository.find({
        relations: ["user"],
        order: { changed_at: "DESC" }
      });

      return res.json(history);
    } catch (error) {
      console.error('Error getting mood history:', error);
      return res.status(500).json({ message: "Erreur lors de la récupération de l'historique" });
    }
  }
}