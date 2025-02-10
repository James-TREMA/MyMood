import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1705789000000 implements MigrationInterface {
    name = 'Initial1705789000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Créer la table migrations si elle n'existe pas
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "migrations" (
                "id" SERIAL PRIMARY KEY,
                "timestamp" bigint NOT NULL,
                "name" varchar NOT NULL
            )
        `);

        // Users table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" SERIAL PRIMARY KEY,
                "name" varchar(255) NOT NULL,
                "email" varchar(255) UNIQUE NOT NULL,
                "password" varchar(255) NOT NULL,
                "role" varchar(20) NOT NULL CHECK (role IN ('student', 'supervisor', 'admin')),
                "preferences" JSONB,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Cohorts table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cohorts" (
                "id" SERIAL PRIMARY KEY,
                "name" varchar(255) NOT NULL,
                "created_by" integer NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE CASCADE
            )
        `);

        // Cohort assignments table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cohort_assignments" (
                "id" SERIAL PRIMARY KEY,
                "user_id" integer NOT NULL,
                "cohort_id" integer NOT NULL,
                "assigned_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
                FOREIGN KEY ("cohort_id") REFERENCES "cohorts" ("id") ON DELETE CASCADE,
                UNIQUE ("user_id", "cohort_id")
            )
        `);

        // Mood scores table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "mood_scores" (
                "id" SERIAL PRIMARY KEY,
                "user_id" integer NOT NULL,
                "score" integer NOT NULL CHECK (score >= 1 AND score <= 100),
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
            )
        `);

        // Alerts table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "alerts" (
                "id" SERIAL PRIMARY KEY,
                "user_id" integer NOT NULL,
                "supervisor_id" integer NOT NULL,
                "status" varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "resolved_at" TIMESTAMP WITH TIME ZONE,
                FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
                FOREIGN KEY ("supervisor_id") REFERENCES "users" ("id") ON DELETE CASCADE
            )
        `);

        // Mood history table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "mood_history" (
                "id" SERIAL PRIMARY KEY,
                "user_id" integer NOT NULL,
                "previous_score" integer NOT NULL,
                "new_score" integer NOT NULL,
                "changed_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
            )
        `);

        // Blacklisted students table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "blacklisted_students" (
                "id" SERIAL PRIMARY KEY,
                "student_id" integer NOT NULL,
                "cohort_id" integer NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("student_id") REFERENCES "users" ("id") ON DELETE CASCADE,
                FOREIGN KEY ("cohort_id") REFERENCES "cohorts" ("id") ON DELETE CASCADE,
                UNIQUE ("student_id", "cohort_id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "blacklisted_students"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "mood_history"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "alerts"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "mood_scores"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cohort_assignments"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cohorts"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "migrations"`);
    }
}