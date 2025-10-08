import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IPayload } from 'src/core/common/interfaces/payload.interface';
import emailConfig from 'src/core/config/email.config';
import jwtConfig from 'src/core/config/jwt.config';
import { RedisService } from 'src/core/redis/redis.service';

import { EmailService } from '../email/email.service';
import { PlansService } from '../plans/plans.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/roles.enum';
import type { IRequestUser } from '../users/interfaces/user.interface';
import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @Inject(jwtConfig.KEY)
    private readonly jwtCfg: ConfigType<typeof jwtConfig>,
    @Inject(emailConfig.KEY)
    private readonly config: ConfigType<typeof emailConfig>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly plansService: PlansService,
  ) {}

  public async validateLocal(dto: AuthDto) {
    const { email, password } = dto;
    const user = await this.usersRepo.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        verified: true,
        role: true,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credential');

    const isPasswordValid = await user.compare(password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credential');

    if (!user.verified) {
      throw new UnauthorizedException(
        'Please verify your email before signing in',
      );
    }

    return this.createRequestUser(user);
  }

  public async validateJwt(payload: IPayload) {
    const user = await this.usersRepo.findOneBy({ id: payload.sub });
    if (!user) throw new UnauthorizedException('Invalid token');

    return this.createRequestUser(user);
  }

  public async signup(dto: AuthDto) {
    const { email, password } = dto;
    const existing = await this.usersRepo.findOneBy({ email });

    if (existing) throw new ConflictException('Account already exists!');

    // Assign starter plan
    const starterPlan = await this.plansService.findOne('', 'starter');

    if (!starterPlan) {
      this.logger.error('Starter plan not found during signup');
      throw new Error(
        'Starter plan not found. Please ensure default plans are seeded.',
      );
    }

    const user = this.usersRepo.create({
      email,
      password,
      plan: starterPlan,
      tasks_left: starterPlan.task_limit,
    });
    const savedUser = await this.usersRepo.save(user);

    // Generate and send verification code
    this.sendVerificationCode(savedUser).catch((error) => {
      this.logger.error(
        `Failed to send verification email to ${email}`,
        error instanceof Error ? error.stack : String(error),
      );
    });

    return {
      message: `A verification code has been sent to ${email}. Please check your email and verify your account at /api/v1/auth/verify-email`,
    };
  }

  public async signin(user: IRequestUser) {
    // Update last login timestamp
    await this.usersRepo.update(user.id, { lastLoginAt: new Date() });

    return this.generateTokens(user);
  }

  public async refreshTokens(userId: string, refreshToken: string) {
    const redisToken = await this.redisService.getRefreshToken(userId);
    if (!redisToken || redisToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const decoded = this.jwtService.verify<IPayload>(refreshToken, {
      secret: this.jwtCfg.secret,
    });

    if (!decoded) throw new UnauthorizedException('Invalid refresh token');

    const payload: IRequestUser = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    return this.generateTokens(payload, refreshToken);
  }

  public async signout(userId: string) {
    await this.redisService.invalidateRefreshToken(userId);
  }

  public async changePassword(id: string, dto: ChangePasswordDto) {
    const { newPassword, currentPassword } = dto;
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found!');

    if (!(await user.compare(currentPassword))) {
      throw new UnauthorizedException('Invalid current password!');
    }

    user.password = newPassword;
    await this.usersRepo.save(user);

    // Invalidate refresh token after password change
    await this.redisService.invalidateRefreshToken(id);

    return { message: 'Password changed successfully' };
  }

  public async assignRole(id: string, role: UserRole) {
    const user = await this.usersRepo.preload({ id, role });

    if (!user) throw new NotFoundException('User not found');

    return this.usersRepo.save(user);
  }

  public async verifyEmail(dto: VerifyEmailDto) {
    const { email, code } = dto;
    const user = await this.usersRepo.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        verified: true,
        verification_code: true,
        verification_code_expires_at: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    if (user.verified) throw new BadRequestException('Email already verified');

    if (!user.verification_code || !user.verification_code_expires_at) {
      throw new BadRequestException(
        'No verification code found. Please request a new one',
      );
    }

    if (new Date() > user.verification_code_expires_at) {
      throw new BadRequestException(
        'Verification code has expired. Please request a new one',
      );
    }

    if (user.verification_code !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    // Mark user as verified
    user.verified = true;
    user.verification_code = undefined;
    user.verification_code_expires_at = undefined;
    await this.usersRepo.save(user);

    return {
      message:
        'Email verified successfully. You can now sign in at /api/v1/auth/signin',
    };
  }

  public async resendVerificationCode(dto: ResendVerificationDto) {
    const { email } = dto;
    const user = await this.usersRepo.findOne({ where: { email } });

    if (!user) throw new NotFoundException('User not found');
    if (user.verified) throw new BadRequestException('Email already verified');

    await this.sendVerificationCode(user);

    return {
      message: 'Verification code sent successfully. Please check your email.',
    };
  }

  private createRequestUser(user: User): IRequestUser {
    const { id, email, role } = user;
    return { id, email, role };
  }

  private async signToken(
    payload: IPayload,
    secret: string,
    expiresIn: number,
  ) {
    return this.jwtService.signAsync(payload, { secret, expiresIn });
  }

  private async generateTokens(user: IRequestUser, oldRefreshToken?: string) {
    // Invalidate old refresh token if provided
    if (oldRefreshToken) {
      await this.redisService.invalidateRefreshToken(user.id);
    }

    const payload: IPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.signToken(
      payload,
      this.jwtCfg.secret,
      this.jwtCfg.signOptions.expiresIn,
    );

    const refreshToken = await this.signToken(
      payload,
      this.jwtCfg.secret,
      this.jwtCfg.refreshTokenTtl,
    );

    await this.redisService.setRefreshToken(
      user.id,
      refreshToken,
      this.jwtCfg.refreshTokenTtl,
    );

    return { accessToken, refreshToken };
  }

  private async sendVerificationCode(user: User): Promise<void> {
    const code = this.generateVerificationCode();
    const expiresAt = new Date(
      Date.now() + this.config.verificationCodeTtl * 1000,
    );

    user.verification_code = code;
    user.verification_code_expires_at = expiresAt;
    await this.usersRepo.save(user);

    await this.emailService.sendVerificationEmail(user.email, code, user.name);
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
