import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { CreateUserDto } from './dto/create.user.dto.js';
import { Role } from '../common/auth/role.js';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  createUser(user: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        phone: user.phone,
        role: { connect: { name: Role.USER } },
      },
      include: { role: true },
    });
  }

  loginUser(email?: string, name?: string, phone?: string) {
    const identifiers = [
      email ? { email } : undefined,
      name ? { name } : undefined,
      phone ? { phone } : undefined,
    ].filter((identifier) => identifier !== undefined);

    if (identifiers.length === 0) {
      return Promise.resolve(null);
    }

    return this.prisma.user.findFirst({
      where: { OR: identifiers },
      include: { role: true },
    });
  }

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
