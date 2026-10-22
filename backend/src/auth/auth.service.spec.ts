import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { AuthRepository } from './auth.repository.js';
import { HashingServiceTsService } from '../common/hashing/hashing.service.ts/hashing.service.ts.service.js';
import type { CreateUserDto } from './dto/create.user.dto.js';

describe('AuthService', () => {
  const now = new Date('2026-10-22T00:00:00.000Z');
  const storedUser = {
    id: 1,
    name: 'Test User',
    email: 'user@example.com',
    password: 'hashed-password',
    phone: '1234567890',
    roleId: 1,
    role: {
      id: 1,
      name: 'USER',
      createdAt: now,
      updatedAt: now,
    },
    createdAt: now,
    updatedAt: now,
  };

  const authRepository = {
    findUserByEmail: vi.fn(),
    createUser: vi.fn(),
    loginUser: vi.fn(),
  };
  const hashingService = {
    hashPassword: vi.fn(),
    verifyPassword: vi.fn(),
  };
  const jwtService = {
    signAsync: vi.fn(),
  };

  const service = new AuthService(
    hashingService as unknown as HashingServiceTsService,
    authRepository as unknown as AuthRepository,
    jwtService as unknown as JwtService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('always creates a USER and ignores a caller-supplied role', async () => {
    authRepository.findUserByEmail.mockResolvedValue(null);
    hashingService.hashPassword.mockResolvedValue('hashed-password');
    authRepository.createUser.mockResolvedValue(storedUser);

    const input = {
      name: 'Test User',
      email: 'user@example.com',
      password: 'password',
      phone: '1234567890',
      role: 999,
    } as CreateUserDto;

    const result = await service.registerUser(input);

    expect(authRepository.createUser).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'user@example.com',
      password: 'hashed-password',
      phone: '1234567890',
    });
    expect(result).toMatchObject({ role: 'USER' });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('roleId');
  });

  it('returns the canonical role and never exposes the password on login', async () => {
    authRepository.loginUser.mockResolvedValue(storedUser);
    hashingService.verifyPassword.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('access-token');

    const result = await service.loginUser({
      email: 'user@example.com',
      name: undefined,
      phone: undefined,
      password: 'password',
    });

    expect(result).toMatchObject({
      email: 'user@example.com',
      role: 'USER',
      accessToken: 'access-token',
    });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('roleId');
  });
});
