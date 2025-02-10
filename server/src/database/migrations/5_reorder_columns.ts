import { MigrationInterface, QueryRunner } from "typeorm";

export class ReorderColumns1705789000005 implements MigrationInterface {
    name = 'ReorderColumns1705789000005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Créer une table temporaire avec l'ordre des colonnes souhaité
        await queryRunner.query(`
            CREATE TABLE users_temp (
                id SERIAL PRIMARY KEY,
                name varchar(255) NOT NULL,
                email varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL,
                role varchar(20) NOT NULL CHECK (role IN ('student', 'supervisor', 'admin')),
                preferences JSONB,
                last_mood integer,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Copier les données dans le bon ordre
        await queryRunner.query(`
            INSERT INTO users_temp (id, name, email, password, role, preferences, last_mood, created_at, updated_at)
            SELECT id, name, email, password, role, preferences, last_mood, created_at, updated_at
            FROM users;
        `);

        // Supprimer les contraintes de clé étrangère existantes
        await queryRunner.query(`
            ALTER TABLE cohorts DROP CONSTRAINT IF EXISTS cohorts_created_by_fkey;
            ALTER TABLE cohort_assignments DROP CONSTRAINT IF EXISTS cohort_assignments_user_id_fkey;
            ALTER TABLE mood_scores DROP CONSTRAINT IF EXISTS mood_scores_user_id_fkey;
            ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_user_id_fkey;
            ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_supervisor_id_fkey;
            ALTER TABLE mood_history DROP CONSTRAINT IF EXISTS mood_history_user_id_fkey;
            ALTER TABLE blacklisted_students DROP CONSTRAINT IF EXISTS blacklisted_students_student_id_fkey;
        `);

        // Supprimer l'ancienne table
        await queryRunner.query(`DROP TABLE users;`);

        // Renommer la table temporaire
        await queryRunner.query(`ALTER TABLE users_temp RENAME TO users;`);

        // Recréer les index
        await queryRunner.query(`
            CREATE INDEX idx_users_email ON users(email);
            CREATE INDEX idx_users_role ON users(role);
        `);

        // Recréer les contraintes de clé étrangère
        await queryRunner.query(`
            ALTER TABLE cohorts 
            ADD CONSTRAINT cohorts_created_by_fkey 
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

            ALTER TABLE cohort_assignments 
            ADD CONSTRAINT cohort_assignments_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

            ALTER TABLE mood_scores 
            ADD CONSTRAINT mood_scores_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

            ALTER TABLE alerts 
            ADD CONSTRAINT alerts_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

            ALTER TABLE alerts 
            ADD CONSTRAINT alerts_supervisor_id_fkey 
            FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE;

            ALTER TABLE mood_history 
            ADD CONSTRAINT mood_history_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

            ALTER TABLE blacklisted_students 
            ADD CONSTRAINT blacklisted_students_student_id_fkey 
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // La restauration n'est pas nécessaire car l'ordre des colonnes n'affecte pas la fonctionnalité
        return;
    }
}