import { Request, Response } from "express";
import { AppDataSource } from "../database/database";
import { Cohort } from "../entities/models/Cohort";
import { CohortAssignment } from "../entities/models/CohortAssignment";
import { User } from "../entities/models/User";
import { BlacklistedStudent } from "../entities/models/BlacklistedStudent";
import { MoodScore } from "../entities/models/MoodScore";

const getRepositories = () => {
  return {
    cohortRepository: AppDataSource.getRepository(Cohort),
    assignmentRepository: AppDataSource.getRepository(CohortAssignment),
    userRepository: AppDataSource.getRepository(User),
    blacklistRepository: AppDataSource.getRepository(BlacklistedStudent)
  };
};

export class CohortController {
  static async create(req: Request, res: Response) {
    try {
      const { cohortRepository, userRepository } = getRepositories();
      const { name } = req.body;
      const userId = req.user?.userId;

      const creator = await userRepository.findOne({ where: { id: userId } });
      if (!creator || creator.role !== 'admin') {
        return res.status(403).json({ message: "Seuls les administrateurs peuvent créer des cohortes" });
      }

      const cohort = cohortRepository.create({
        name,
        created_by: userId,
      });

      await cohortRepository.save(cohort);
      return res.status(201).json(cohort);
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de la création de la cohorte" });
    }
  }

  static async getCohorts(req: Request, res: Response) {
    try {
      const { cohortRepository, userRepository } = getRepositories();
      const userId = req.user?.userId;
      console.log('Getting cohorts with userId:', userId);

      const user = await userRepository.findOne({ where: { id: userId } });

      let cohorts;
      if (user?.role === 'admin') {
        cohorts = await cohortRepository.find({
          relations: ["creator", "assignments.user"],
          select: {
            id: true,
            name: true,
            created_by: true,
            assignments: {
              id: true,
              user: {
                id: true,
                name: true,
                last_mood: true
              }
            }
          },
          cache: true
        });
      } else if (user?.role === 'supervisor') {
        cohorts = await cohortRepository.find({
          relations: ["creator", "assignments.user"],
          select: {
            id: true,
            name: true,
            created_by: true,
            assignments: {
              id: true,
              user: {
                id: true,
                name: true,
                last_mood: true
              }
            }
          },
          cache: true
        });
      } else {
        return res.status(403).json({ message: "Non autorisé à voir les cohortes" });
      }

      // Calculer les moyennes en mémoire plutôt qu'avec des requêtes supplémentaires
      for (const cohort of cohorts) {
        let totalMood = 0;
        let studentCount = 0;

        if (cohort.assignments) {
          for (const assignment of cohort.assignments) {
            if (assignment.user.last_mood) {
              totalMood += assignment.user.last_mood;
              studentCount++;
            }
          }
        }

        cohort.averageMood = studentCount > 0 ? Math.round(totalMood / studentCount) : undefined;
      }

      console.log('Found cohorts:', cohorts);
      return res.json(cohorts);
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de la récupération des cohortes" });
    }
  }

  static async getCohortById(req: Request, res: Response) {
    try {
      const { cohortRepository, userRepository } = getRepositories();
      const moodScoreRepository = AppDataSource.getRepository(MoodScore);
      const { id } = req.params;
      const userId = req.user?.userId;
      const user = await userRepository.findOne({ where: { id: userId } });

      const cohort = await cohortRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["creator", "assignments", "assignments.user"],
        select: {
          id: true,
          name: true,
          created_by: true,
          assignments: {
            id: true,
            user: {
              id: true,
              name: true,
              last_mood: true
            }
          }
        }
      });

      if (!cohort) {
        return res.status(404).json({ message: "Cohorte non trouvée" });
      }

      if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
        return res.status(403).json({ message: "Non autorisé à voir cette cohorte" });
      }

      // Récupérer les dernières humeurs pour chaque étudiant
      const students = cohort.assignments
        .filter(assignment => assignment.user)
        .map(assignment => ({
          name: assignment.user.name,
          last_mood: assignment.user.last_mood || 0
        }));

      // Calculer la moyenne des humeurs
      const validMoods = students
        .map(student => student.last_mood)
        .filter(mood => mood > 0);

      const averageMood = validMoods.length > 0
        ? Math.round(validMoods.reduce((sum, mood) => sum + mood, 0) / validMoods.length)
        : 0;

      return res.json({
        id: cohort.id,
        name: cohort.name,
        students,
        averageMood
      });
    } catch (error) {
      console.error('Error in getCohortById:', error);
      return res.status(500).json({ message: "Erreur lors de la récupération de la cohorte" });
    }
  }

  static async assignUser(req: Request, res: Response) {
    try {
      const { assignmentRepository, blacklistRepository } = getRepositories();
      const { userId } = req.body;
      const cohortId = parseInt(req.params.id);

      // Vérifier si l'étudiant est blacklisté
      const blacklisted = await blacklistRepository.findOne({
        where: { student_id: userId, cohort_id: cohortId }
      });

      if (blacklisted) {
        return res.status(403).json({ message: "Cet étudiant est blacklisté pour cette cohorte" });
      }

      const existingAssignment = await assignmentRepository.findOne({
        where: { user_id: userId, cohort_id: cohortId }
      });

      if (existingAssignment) {
        return res.status(400).json({ message: "L'utilisateur est déjà assigné à cette cohorte" });
      }

      const assignment = assignmentRepository.create({
        user_id: userId,
        cohort_id: cohortId,
      });

      await assignmentRepository.save(assignment);
      return res.status(201).json(assignment);
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de l'assignation de l'utilisateur" });
    }
  }

  static async blacklistStudent(req: Request, res: Response) {
    try {
      const { assignmentRepository, blacklistRepository } = getRepositories();
      const { studentId } = req.body;
      const cohortId = parseInt(req.params.id);

      const blacklist = blacklistRepository.create({
        student_id: studentId,
        cohort_id: cohortId,
      });

      await blacklistRepository.save(blacklist);

      // Supprimer l'assignation existante si elle existe
      await assignmentRepository.delete({
        user_id: studentId,
        cohort_id: cohortId
      });

      return res.status(201).json(blacklist);
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors du blacklist de l'étudiant" });
    }
  }

  static async deleteCohort(req: Request, res: Response) {
    try {
      const { cohortRepository } = getRepositories();
      const { id } = req.params;
      const result = await cohortRepository.delete(id);
      
      if (result.affected === 0) {
        return res.status(404).json({ message: "Cohorte non trouvée" });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de la suppression de la cohorte" });
    }
  }

  static async removeStudent(req: Request, res: Response) {
    try {
      const { assignmentRepository } = getRepositories();
      const { cohortId, studentId } = req.params;
      
      const result = await assignmentRepository.delete({
        cohort_id: parseInt(cohortId),
        user_id: parseInt(studentId)
      });

      if (result.affected === 0) {
        return res.status(404).json({ message: "Assignation non trouvée" });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors du retrait de l'étudiant" });
    }
  }
}