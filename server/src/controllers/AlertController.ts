import { Request, Response } from "express";
import { AppDataSource } from "../database/database";
import { Alert } from "../entities/models/Alert";
import { User } from "../entities/models/User";

const getRepositories = () => {
  return {
    alertRepository: AppDataSource.getRepository(Alert),
    userRepository: AppDataSource.getRepository(User)
  };
};

export class AlertController {
  static async createAlert(req: Request, res: Response) {
    try {
      const { alertRepository, userRepository } = getRepositories();
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Non authentifié" });
      }
      
      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ['cohortAssignments', 'cohortAssignments.cohort', 'cohortAssignments.cohort.creator']
      });

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      if (user.role !== 'student') {
        return res.status(403).json({ message: "Seuls les étudiants peuvent lancer des alertes" });
      }

      // Trouver tous les superviseurs disponibles
      const supervisors = await userRepository.find({
        where: { role: 'supervisor' }
      });

      if (supervisors.length === 0) {
        return res.status(400).json({ message: "Aucun superviseur disponible" });
      }

      // Assigner l'alerte au premier superviseur disponible
      const supervisor = supervisors[0];

      const alert = alertRepository.create({
        user_id: user.id,
        supervisor_id: supervisor.id,
        status: "pending"
      });

      const savedAlert = await alertRepository.save(alert);

      return res.status(201).json(savedAlert);
    } catch (error) {
      console.error('Error creating alert:', error);
      return res.status(500).json({ message: "Erreur lors de la création de l'alerte" });
    }
  }

  static async getStudentAlerts(req: Request, res: Response) {
    try {
      const { alertRepository, userRepository } = getRepositories();
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      if (user.role !== 'student') {
        return res.status(403).json({ message: "Cette route est réservée aux étudiants" });
      }

      const alerts = await alertRepository.find({
        where: { user_id: userId },
        order: { created_at: 'DESC' }
      });
      return res.json(alerts);
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de la création de l'alerte" });
    }
  }

  static async getAlerts(req: Request, res: Response) {
    try {
      const { alertRepository, userRepository } = getRepositories();
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      let queryBuilder = alertRepository.createQueryBuilder('alert')
        .leftJoinAndSelect('alert.user', 'user')
        .leftJoinAndSelect('alert.supervisor', 'supervisor')
        .orderBy('alert.created_at', 'DESC');

      if (!['supervisor', 'admin'].includes(user.role)) {
        // Les étudiants ne peuvent pas voir les alertes
        return res.status(403).json({ message: "Non autorisé à voir les alertes" });
      }

      // Admin et superviseurs voient toutes les alertes
      const alerts = await queryBuilder.getMany();

      return res.json(alerts);
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de la récupération des alertes" });
    }
  }

  static async resolveAlert(req: Request, res: Response) {
    try {
      const { alertRepository, userRepository } = getRepositories();
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const user = await userRepository.findOne({ 
        where: { id: userId }
      });

      if (!user || user.role === 'student') {
        return res.status(403).json({ message: "Non autorisé à résoudre les alertes" });
      }

      const alert = await alertRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!alert) {
        return res.status(404).json({ message: "Alerte non trouvée" });
      }

      alert.status = "resolved";
      alert.resolved_at = new Date();
      const updatedAlert = await alertRepository.save(alert);

      return res.json(updatedAlert);
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de la résolution de l'alerte" });
    }
  }

  static async deleteAlert(req: Request, res: Response) {
    try {
      const { alertRepository, userRepository } = getRepositories();
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Seuls les administrateurs peuvent supprimer des alertes" });
      }

      const result = await alertRepository.delete(id);
      
      if (result.affected === 0) {
        return res.status(404).json({ message: "Alerte non trouvée" });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de la suppression de l'alerte" });
    }
  }
}