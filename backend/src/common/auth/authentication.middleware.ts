import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { NextFunction, Response } from 'express';
import type {
  AccessTokenPayload,
  AuthenticatedRequest,
} from './authenticated-request.js';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(
    request: AuthenticatedRequest,
    _response: Response,
    next: NextFunction,
  ): Promise<void> {
    const token = this.extractBearerToken(request.headers.authorization);

    if (token) {
      try {
        const payload =
          await this.jwtService.verifyAsync<AccessTokenPayload>(token);

        if (typeof payload.userId === 'number') {
          request.auth = payload;
        }
      } catch {
        request.auth = undefined;
      }
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
