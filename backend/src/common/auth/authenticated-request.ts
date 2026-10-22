import type { Request } from 'express';
import type { Role } from './role.js';

export interface AccessTokenPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  auth?: AuthenticatedUser;
}
