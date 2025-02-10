import { DataSource } from "typeorm";
import { AppDataSource } from "../database";
import * as fs from 'fs';
import * as path from 'path';

export async function generateMigration(name: string): Promise<void> {
  try {
    // Initialiser la connexion
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Générer la migration
    const timestamp = Date.now();
    const migrationName = `${timestamp}-${name}`;
    
    await AppDataSource.driver.createSchemaBuilder().log();
    
    const sqlInMemory = await AppDataSource.driver
      .createSchemaBuilder()
      .log();

    if (sqlInMemory.upQueries.length === 0) {
      console.log('Aucun changement détecté dans les entités');
      return;
    }

    // Créer le contenu de la migration
    const migrationContent = `import { MigrationInterface, QueryRunner } from "typeorm";

export class ${name}${timestamp} implements MigrationInterface {
    name = '${name}${timestamp}'

    public async up(queryRunner: QueryRunner): Promise<void> {
        ${sqlInMemory.upQueries.map(query => 
          `await queryRunner.query(\`${query.query}\`);`
        ).join('\n        ')}
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        ${sqlInMemory.downQueries.map(query => 
          `await queryRunner.query(\`${query.query}\`);`
        ).join('\n        ')}
    }
}`;

    // Écrire le fichier de migration
    const migrationPath = path.join(__dirname, '..', 'migrations', `${migrationName}.ts`);
    fs.writeFileSync(migrationPath, migrationContent);

    console.log(`Migration générée avec succès: ${migrationPath}`);
  } catch (error) {
    console.error('Erreur lors de la génération de la migration:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}