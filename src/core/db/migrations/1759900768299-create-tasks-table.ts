import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasksTable1759900768299 implements MigrationInterface {
    name = 'CreateTasksTable1759900768299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'done')
        `);
        await queryRunner.query(`
            CREATE TABLE "tasks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255) NOT NULL,
                "description" text,
                "status" "public"."task_status" NOT NULL DEFAULT 'todo',
                "due_at" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_db55af84c226af9dce09487b61b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tasks" DROP CONSTRAINT "FK_db55af84c226af9dce09487b61b"
        `);
        await queryRunner.query(`
            DROP TABLE "tasks"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."task_status"
        `);
    }

}
