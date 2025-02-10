import { DataSource } from "typeorm";
import { generateMigration } from "./migration";
import { User } from "../../entities/models/User";

export async function checkSchemaChanges(dataSource: DataSource): Promise<void> {
  try {
    // Vérifier si la table users existe
    const hasUsersTable = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    // Si la table users n'existe pas, la créer
    if (!hasUsersTable[0].exists) {
      console.log('Création de la table users...');
      await dataSource.synchronize(false);
      return;
    }

    // Récupérer les changements de schéma en mémoire
    const sqlInMemory = await dataSource.driver
      .createSchemaBuilder()
      .log();

    // S'il y a des changements
    if (sqlInMemory.upQueries.length > 0) {
      console.log('\nChangements de schéma détectés:');
      sqlInMemory.upQueries.forEach((query, index) => {
        console.log(`${index + 1}. ${query.query}`);
      });

      // Nettoyer les données invalides avant d'ajouter les contraintes
      await cleanInvalidData(dataSource);

      // Générer une migration automatique
      const timestamp = Date.now();
      const migrationName = `AutoSync${timestamp}`;
      await generateMigration(migrationName);

      // Exécuter les requêtes de synchronisation
      for (const query of sqlInMemory.upQueries) {
        await dataSource.query(query.query);
      }

      console.log('Schéma de base de données synchronisé avec succès\n');
    } else {
      console.log('Schéma de base de données à jour\n');
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du schéma:', error);
    throw error;
  }
}

async function cleanInvalidData(dataSource: DataSource): Promise<void> {
  try {
    // Supprimer les enregistrements mood_scores qui référencent des utilisateurs inexistants
    await dataSource.query(`
      DELETE FROM mood_scores 
      WHERE user_id NOT IN (SELECT id FROM users)
    `);

    // Supprimer les enregistrements alerts qui référencent des utilisateurs inexistants
    await dataSource.query(`
      DELETE FROM alerts 
      WHERE user_id NOT IN (SELECT id FROM users) 
      OR supervisor_id NOT IN (SELECT id FROM users)
    `);

    // Supprimer les enregistrements mood_history qui référencent des utilisateurs inexistants
    await dataSource.query(`
      DELETE FROM mood_history 
      WHERE user_id NOT IN (SELECT id FROM users)
    `);

    // Supprimer les enregistrements cohort_assignments qui référencent des utilisateurs inexistants
    await dataSource.query(`
      DELETE FROM cohort_assignments 
      WHERE user_id NOT IN (SELECT id FROM users)
    `);

    // Supprimer les enregistrements blacklisted_students qui référencent des utilisateurs inexistants
    await dataSource.query(`
      DELETE FROM blacklisted_students 
      WHERE student_id NOT IN (SELECT id FROM users)
    `);

    console.log('Nettoyage des données invalides effectué avec succès');
  } catch (error) {
    console.error('Erreur lors du nettoyage des données:', error);
    throw error;
  }
}