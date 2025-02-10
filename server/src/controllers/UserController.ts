import { Request, Response } from "express";
import { AppDataSource } from "../database/database";
import { User } from "../entities/models/User";
import { MoodScore } from "../entities/models/MoodScore";
import { Alert } from "../entities/models/Alert";
import { CohortAssignment } from "../entities/models/CohortAssignment";
import { MoodHistory } from "../entities/models/MoodHistory";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

const initializeUserRepository = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource.getRepository(User);
};

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      const userRepository = await initializeUserRepository();

      // Validation des champs requis
      if (!name || !email || !password || !role) {
        return res.status(400).json({ 
          message: "Tous les champs sont requis (name, email, password, role)" 
        });
      }

      // Vérification du rôle valide
      if (!['student', 'supervisor', 'admin'].includes(role)) {
        return res.status(400).json({ 
          message: "Le rôle doit être 'student', 'supervisor' ou 'admin'" 
        });
      }

      // Vérification si l'email existe déjà
      const existingUser = await userRepository.findOne({ 
        where: { email } 
      });

      if (existingUser) {
        return res.status(400).json({ 
          message: "Cet email est déjà utilisé" 
        });
      }

      // Hashage du mot de passe
      const hashedPassword = await hash(password, 10);

      // Création de l'utilisateur
      const user = userRepository.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      // Sauvegarde dans la base de données
      await userRepository.save(user);

      // Génération du token JWT
      const token = sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "24h" }
      );

      // Retour de la réponse sans le mot de passe
      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json({ 
        user: userWithoutPassword, 
        token 
      });
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      return res.status(500).json({ 
        message: "Erreur lors de l'inscription",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }

      const userRepository = await initializeUserRepository();

      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: "Email ou mot de passe incorrect" 
        });
      }

      const isValidPassword = await compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false,
          message: "Email ou mot de passe incorrect" 
        });
      }

      const token = sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "24h" }
      );

      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({ 
        success: true,
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error: any) {
      console.error("Erreur lors de la connexion:", error);
      return res.status(500).json({ 
        success: false,
        message: "Erreur lors de la connexion",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const userRepository = await initializeUserRepository();

      const user = await userRepository.findOne({
        where: { id: userId },
        relations: [
          "moodScores",
          "alerts",
          "supervisedAlerts",
          "cohortAssignments.cohort",
          "createdCohorts",
          "moodHistory"
        ]
      });

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Erreur lors de la récupération du profil:", error);
      return res.status(500).json({ 
        message: "Erreur lors de la récupération du profil",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const userRepository = await initializeUserRepository();
      const users = await userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.cohortAssignments', 'assignments')
        .leftJoinAndSelect('assignments.cohort', 'cohort')
        .orderBy('user.name', 'ASC')
        .getMany();
      
      const usersWithoutPasswords = users.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.json(usersWithoutPasswords);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      return res.status(500).json({ 
        message: "Erreur lors de la récupération des utilisateurs",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      const userRepository = await initializeUserRepository();

      const hashedPassword = await hash(password, 10);
      
      const user = userRepository.create({
        name,
        email,
        password: hashedPassword,
        role
      });

      await userRepository.save(user);
      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      return res.status(500).json({ 
        message: "Erreur lors de la création de l'utilisateur",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRepository = await initializeUserRepository();
      const { name, email, role } = req.body;

      const user = await userRepository.findOne({ where: { id: parseInt(id) } });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;

      await userRepository.save(user);
      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      return res.status(500).json({ 
        message: "Erreur lors de la mise à jour de l'utilisateur",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Vérifier si l'utilisateur existe
        const user = await queryRunner.manager.findOne(User, { 
          where: { id: userId } 
        });

        if (!user) {
          await queryRunner.rollbackTransaction();
          return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Supprimer toutes les relations en une seule transaction
        await Promise.all([
          queryRunner.manager.delete(MoodScore, { user_id: userId }),
          queryRunner.manager.delete(Alert, [
            { user_id: userId },
            { supervisor_id: userId }
          ]),
          queryRunner.manager.delete(CohortAssignment, { user_id: userId }),
          queryRunner.manager.delete(MoodHistory, { user_id: userId })
        ]);

        // Supprimer l'utilisateur
        await queryRunner.manager.delete(User, userId);

        await queryRunner.commitTransaction();
        return res.status(204).send();

      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error("Erreur lors de la suppression de l'utilisateur:", errorMessage);
      return res.status(500).json({ 
        message: "Erreur lors de la suppression de l'utilisateur",
        error: errorMessage
      });
    }
  }

  static async getPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const userRepository = await initializeUserRepository();

      const user = await userRepository.findOne({
        where: { id: userId },
        select: ['id', 'preferences']
      });

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Initialiser les préférences par défaut si NULL
      if (!user.preferences) {
        user.preferences = {
          dailyReminders: false,
          emailNotifications: false
        };
        await userRepository.save(user);
      }

      return res.json(user.preferences || {
        dailyReminders: false,
        emailNotifications: false
      });
    } catch (error) {
      console.error('Error getting preferences:', error);
      return res.status(500).json({ message: "Erreur lors de la récupération des préférences" });
    }
  }

  static async updatePreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { dailyReminders, emailNotifications } = req.body;
      const userRepository = await initializeUserRepository();

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Mettre à jour les préférences
      user.preferences = {
        dailyReminders,
        emailNotifications
      };

      await userRepository.save(user);
      return res.json(user.preferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      return res.status(500).json({ message: "Erreur lors de la mise à jour des préférences" });
    }
  }
}