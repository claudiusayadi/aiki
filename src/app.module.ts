import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { HealthModule } from './modules/health/health.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PlansModule } from './modules/plans/plans.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { UsersModule } from './modules/users/users.module';

import { validateEnv } from './core/config/app.config';
import { apiProviders } from './core/config/providers.config';
import throttlerConfig from './core/config/throttler.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync(throttlerConfig.asProvider()),
    AuthModule,
    EmailModule,
    HealthModule,
    PaymentsModule,
    PlansModule,
    TasksModule,
    UsersModule,
  ],
  controllers: [],
  providers: [...apiProviders],
})
export class AppModule {}
