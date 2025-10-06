import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { IPayload } from 'src/core/common/interfaces/payload.interface';
import { RequestWithCookies } from 'src/core/common/interfaces/request-with-cookies.interface';
import jwtConfig from 'src/core/config/jwt.config';
import tokensConfig from 'src/core/config/tokens.config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    readonly config: ConfigType<typeof jwtConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJwtFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.secret,
    });
  }

  async validate(payload: IPayload) {
    return this.authService.validateJwt(payload);
  }

  private static extractJwtFromCookie(
    this: void,
    req: RequestWithCookies,
  ): string | null {
    return req.cookies[tokensConfig.access] || null;
  }
}
