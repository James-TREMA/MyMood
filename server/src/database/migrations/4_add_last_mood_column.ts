import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastMoodColumn1705789000004 implements MigrationInterface {
    name = 'AddLastMoodColumn1705789000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajouter la colonne last_mood
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN IF NOT EXISTS "lastMood" integer;
        `);

        // Mettre à jour la colonne last_mood avec les dernières humeurs
        await queryRunner.query(`
            WITH LastMoods AS (
                SELECT DISTINCT ON (user_id) 
                    user_id,
                    score as "lastMood"
                FROM mood_scores
                ORDER BY user_id, created_at DESC
            )
            UPDATE users
            SET "lastMood" = LastMoods."lastMood"
            FROM LastMoods
            WHERE users.id = LastMoods.user_id;
        `);

        // Créer un trigger pour maintenir last_mood à jour
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_user_last_mood()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE users
                SET "lastMood" = NEW.score
                WHERE id = NEW.user_id;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_last_mood ON mood_scores;
            CREATE TRIGGER update_last_mood
            AFTER INSERT ON mood_scores
            FOR EACH ROW
            EXECUTE FUNCTION update_user_last_mood();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer le trigger et la fonction
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_last_mood ON mood_scores;`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_user_last_mood;`);
        
        // Supprimer la colonne
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "lastMood";`);
    }
}