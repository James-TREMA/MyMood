import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastMoodView1705789000003 implements MigrationInterface {
    name = 'AddLastMoodView1705789000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Créer une vue pour obtenir la dernière humeur de chaque utilisateur
        await queryRunner.query(`
            CREATE OR REPLACE VIEW user_last_moods AS
            SELECT DISTINCT ON (user_id)
                user_id,
                score as last_mood,
                created_at
            FROM mood_scores
            ORDER BY user_id, created_at DESC;
        `);

        // Ajouter un index sur user_id et created_at pour optimiser les performances
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_mood_scores_user_created 
            ON mood_scores(user_id, created_at DESC);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS user_last_moods`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_mood_scores_user_created`);
    }
}