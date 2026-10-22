import type { Request } from 'express';

export interface AccessTokenPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  auth?: AccessTokenPayload;
}
