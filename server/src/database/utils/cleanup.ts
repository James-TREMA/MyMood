import { DataSource } from "typeorm";
import { AppDataSource } from "../database";

export const cleanInvalidData = async (): Promise<void> => {
  try {
    // Initialiser une connexion temporaire sans contraintes
    const tempDataSource = new DataSource({
      ...AppDataSource.options,
      synchronize: false,
      migrationsRun: false
    });

    await tempDataSource.initialize();

    // Supprimer les données invalides
    await tempDataSource.query(`
      DELETE FROM alerts;
      DELETE FROM mood_scores;
      DELETE FROM mood_history;
      DELETE FROM cohort_assignments;
      DELETE FROM blacklisted_students;
      DELETE FROM cohorts;
    `);

    console.log('Nettoyage des données invalides effectué');
    
    await tempDataSource.destroy();
  } catch (error) {
    console.error('Erreur lors du nettoyage des données:', error);
    throw error;
  }
};