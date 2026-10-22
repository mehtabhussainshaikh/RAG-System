import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { NextFunction, Response } from 'express';
import type {
  AccessTokenPayload,
  AuthenticatedRequest,
} from './authenticated-request.js';
import { AuthorizationService } from './authorization.service.js';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async use(
    request: AuthenticatedRequest,
    _response: Response,
    next: NextFunction,
  ): Promise<void> {
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      next();
      return;
    }

    let payload: AccessTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
    } catch {
      next();
      return;
    }

    if (Number.isInteger(payload.userId) && payload.userId > 0) {
      request.auth = await this.authorizationService.findAuthenticatedUser(
        payload.userId,
      );
    }

    next();
  }

  private extractBearerToken(authorization?: string): string | undefined {
    if (!authorization) {
      return undefined;
    }

    const [scheme, token, extra] = authorization.trim().split(/\s+/);

    if (scheme?.toLowerCase() !== 'bearer' || !token || extra) {
      return undefined;
    }

    return token;
  }
}
