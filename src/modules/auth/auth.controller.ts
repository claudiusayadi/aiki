import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { IdDto } from 'src/core/common/dto/id.dto';
import type { RequestWithCookies } from 'src/core/common/interfaces/request-with-cookies.interface';
import cookieConfig from 'src/core/config/cookie.config';
import tokensConfig from 'src/core/config/tokens.config';
import { jwtCookieHeader } from 'src/core/swagger/jwt-cookie-header';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from 'src/modules/users/enums/roles.enum';
import type { IRequestUser } from '../users/interfaces/user.interface';
import { AuthService } from './auth.service';
import { ActiveUser } from './decorators/active-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Sign up user' })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  @ApiConflictResponse({ description: 'Account already exists' })
  @Public()
  @Post('signup')
  async signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @ApiCookieAuth(tokensConfig.access)
  @ApiOperation({ summary: 'Sign in user' })
  @ApiOkResponse({
    description: 'User signed in successfully',
    headers: jwtCookieHeader,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('signin')
  async signin(
    @Body() dto: AuthDto,
    @ActiveUser() user: IRequestUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.signin(user);

    res.cookie(tokensConfig.access, accessToken, cookieConfig.access);
    res.cookie(tokensConfig.refresh, refreshToken, cookieConfig.refresh);
    return { message: 'Signed in successfully', user };
  }

  @ApiOperation({ summary: 'Sign out user' })
  @ApiOkResponse({ description: 'User signed out successfully' })
  @HttpCode(HttpStatus.OK)
  @Post('signout')
  async signout(
    @ActiveUser() user: IRequestUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.signout(user.id);
    res.clearCookie(tokensConfig.access, cookieConfig.access);
    res.clearCookie(tokensConfig.refresh, cookieConfig.refresh);
    return { message: 'Signed out successfully' };
  }

  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiOkResponse({ description: 'Tokens refreshed successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  @Post('refresh')
  async refresh(
    @ActiveUser() user: IRequestUser,
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req?.cookies[tokensConfig.refresh];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshTokens(user.id, refreshToken);

    res.cookie(tokensConfig.access, accessToken, cookieConfig.access);
    res.cookie(tokensConfig.refresh, newRefreshToken, cookieConfig.refresh);
    return { message: 'Tokens refreshed successfully' };
  }

  @ApiOperation({ summary: 'Change password' })
  @ApiOkResponse({ description: 'Password changed successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid current password' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch('change-password')
  public async changePassword(
    @ActiveUser() user: IRequestUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto);
  }

  @ApiOperation({ summary: 'Assign role to user' })
  @ApiOkResponse({ description: 'Role assigned successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Roles(UserRole.ADMIN)
  @Patch('assign-role/:id')
  public async assignRole(@Param() { id }: IdDto, @Body() dto: UserRole) {
    return this.authService.assignRole(id, dto);
  }

  @ApiOperation({ summary: 'Verify email with code' })
  @ApiOkResponse({ description: 'Email verified successfully' })
  @ApiBadRequestResponse({
    description: 'Invalid or expired verification code',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('verify-email')
  public async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @ApiOperation({ summary: 'Resend verification code' })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Email already verified' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('resend-verification')
  public async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationCode(dto);
  }
}
