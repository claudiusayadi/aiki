import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePaymentsAndUpdatePlans1759904513924 implements MigrationInterface {
    name = 'CreatePaymentsAndUpdatePlans1759904513924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."payment_status" AS ENUM('pending', 'success', 'failed')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."payment_type" AS ENUM('one_time', 'subscription')
        `);
        await queryRunner.query(`
            CREATE TABLE "payments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "transaction_reference" character varying(255) NOT NULL,
                "amount" numeric(10, 2) NOT NULL,
                "currency" character varying(3) NOT NULL DEFAULT 'NGN',
                "status" "public"."payment_status" NOT NULL DEFAULT 'pending',
                "payment_type" "public"."payment_type" NOT NULL,
                "quantity" integer,
                "metadata" jsonb,
                "user_id" uuid,
                "plan_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_ed7060f04402306c58a2f47bd74" UNIQUE ("transaction_reference"),
                CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "plans"
            ADD "metadata" jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "tasks_left" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "tasks" DROP CONSTRAINT "FK_db55af84c226af9dce09487b61b"
        `);
        await queryRunner.query(`
            ALTER TABLE "tasks"
            ALTER COLUMN "user_id" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_db55af84c226af9dce09487b61b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "payments"
            ADD CONSTRAINT "FK_427785468fb7d2733f59e7d7d39" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "payments"
            ADD CONSTRAINT "FK_f9b6a4c3196864cdd91b1a440ee" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "payments" DROP CONSTRAINT "FK_f9b6a4c3196864cdd91b1a440ee"
        `);
        await queryRunner.query(`
            ALTER TABLE "payments" DROP CONSTRAINT "FK_427785468fb7d2733f59e7d7d39"
        `);
        await queryRunner.query(`
            ALTER TABLE "tasks" DROP CONSTRAINT "FK_db55af84c226af9dce09487b61b"
        `);
        await queryRunner.query(`
            ALTER TABLE "tasks"
            ALTER COLUMN "user_id"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_db55af84c226af9dce09487b61b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "tasks_left"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "plans" DROP COLUMN "metadata"
        `);
        await queryRunner.query(`
            DROP TABLE "payments"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."payment_type"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."payment_status"
        `);
    }

}
