import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import emailConfig from 'src/core/config/email.config';
import jwtConfig from 'src/core/config/jwt.config';
import { RedisModule } from 'src/core/redis/redis.module';

import { PlansModule } from 'src/modules/plans/plans.module';
import { EmailModule } from '../email/email.module';
import { Plan } from '../plans/entities/plan.entity';
import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Plan]),
    PassportModule.register({ session: true }),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(emailConfig),
    RedisModule,
    EmailModule,
    PlansModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
