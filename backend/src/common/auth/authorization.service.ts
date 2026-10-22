import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthenticatedUser } from './authenticated-request.js';
import { isRole } from './role.js';

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAuthenticatedUser(
    userId: number,
  ): Promise<AuthenticatedUser | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: { select: { name: true } },
      },
    });

    if (!user || !isRole(user.role.name)) {
      return undefined;
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role.name,
    };
  }
}
