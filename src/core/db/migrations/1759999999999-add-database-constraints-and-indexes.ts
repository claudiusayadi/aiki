import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDatabaseConstraintsAndIndexes1759999999999
  implements MigrationInterface
{
  name = 'AddDatabaseConstraintsAndIndexes1759999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_users_plan_id"
            FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_tasks_user_id"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

    // Add indexes for performance
    await queryRunner.query(`
            CREATE INDEX "IDX_users_email" ON "users" ("email")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_users_verified" ON "users" ("verified")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_users_plan_id" ON "users" ("plan_id")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_users_created_at" ON "users" ("created_at")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_tasks_user_id" ON "tasks" ("user_id")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_tasks_status" ON "tasks" ("status")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_tasks_due_at" ON "tasks" ("due_at")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_tasks_created_at" ON "tasks" ("created_at")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_plans_slug" ON "plans" ("slug")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_plans_is_subscription" ON "plans" ("is_subscription")
        `);

    // Add check constraints for data integrity
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "CHK_users_tasks_left_non_negative"
            CHECK ("tasks_left" IS NULL OR "tasks_left" >= 0)
        `);

    await queryRunner.query(`
            ALTER TABLE "plans"
            ADD CONSTRAINT "CHK_plans_price_non_negative"
            CHECK ("price" >= 0)
        `);

    await queryRunner.query(`
            ALTER TABLE "plans"
            ADD CONSTRAINT "CHK_plans_task_limit_positive"
            CHECK ("task_limit" IS NULL OR "task_limit" > 0)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop check constraints
    await queryRunner.query(`
            ALTER TABLE "plans" DROP CONSTRAINT "CHK_plans_task_limit_positive"
        `);

    await queryRunner.query(`
            ALTER TABLE "plans" DROP CONSTRAINT "CHK_plans_price_non_negative"
        `);

    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "CHK_users_tasks_left_non_negative"
        `);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_plans_is_subscription"`);
    await queryRunner.query(`DROP INDEX "IDX_plans_slug"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_due_at"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_status"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_users_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_users_plan_id"`);
    await queryRunner.query(`DROP INDEX "IDX_users_verified"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);

    // Drop foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_user_id"
        `);

    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_users_plan_id"
        `);
  }
}
