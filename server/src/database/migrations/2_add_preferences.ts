import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPreferences1705789000001 implements MigrationInterface {
    name = 'AddPreferences1705789000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN IF NOT EXISTS "preferences" JSONB;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN IF EXISTS "preferences";
        `);
    }
}