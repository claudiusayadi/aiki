import { MigrationInterface, QueryRunner } from "typeorm";

export class StarterModels1759837262107 implements MigrationInterface {
    name = 'StarterModels1759837262107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "plans" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "slug" character varying(255) NOT NULL,
                "name" character varying(255),
                "description" text,
                "task_limit" integer,
                "price" numeric(10, 2) NOT NULL DEFAULT '0',
                "is_subscription" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_e7b71bb444e74ee067df057397e" UNIQUE ("slug"),
                CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."user_role" AS ENUM('admin', 'user')
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying(255) NOT NULL,
                "password" character varying(255) NOT NULL,
                "name" character varying(255),
                "phone" character varying(20),
                "bio" character varying(255),
                "verified" boolean NOT NULL DEFAULT false,
                "tasks_left" integer NOT NULL DEFAULT '5',
                "renews_at" TIMESTAMP,
                "role" "public"."user_role" NOT NULL DEFAULT 'user',
                "last_login_at" TIMESTAMP,
                "plan_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_bc1cd381147462a1c604b425f7a" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_bc1cd381147462a1c604b425f7a"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."user_role"
        `);
        await queryRunner.query(`
            DROP TABLE "plans"
        `);
    }

}
