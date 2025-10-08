import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailVerification1759838873727 implements MigrationInterface {
    name = 'AddEmailVerification1759838873727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "verification_code" character varying(6)
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "verification_code_expires_at" TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "verification_code_expires_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "verification_code"
        `);
    }

}
