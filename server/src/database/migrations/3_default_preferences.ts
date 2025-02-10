import { MigrationInterface, QueryRunner } from "typeorm";

export class DefaultPreferences1705789000002 implements MigrationInterface {
    name = 'DefaultPreferences1705789000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Mettre à jour tous les utilisateurs qui ont des préférences NULL
        await queryRunner.query(`
            UPDATE users 
            SET preferences = '{"dailyReminders": false, "emailNotifications": false}'::jsonb 
            WHERE preferences IS NULL;
        `);

        // S'assurer que les nouvelles entrées auront des préférences par défaut
        await queryRunner.query(`
            ALTER TABLE users 
            ALTER COLUMN preferences 
            SET DEFAULT '{"dailyReminders": false, "emailNotifications": false}'::jsonb;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users 
            ALTER COLUMN preferences DROP DEFAULT;
        `);
    }
}