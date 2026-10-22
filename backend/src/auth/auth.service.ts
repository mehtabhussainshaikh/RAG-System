import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto.js';
import { HashingServiceTsService } from '../common/hashing/hashing.service.ts/hashing.service.ts.service.js';
import { AuthRepository } from './auth.repository.js';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto.js';

interface TokenUser {
  id: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingServiceTsService,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const isUserExists = await this.authRepository.findUserByEmail(
      createUserDto.email,
    );

    if (isUserExists) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.authRepository.createUser({
      name: createUserDto.name,
      email: createUserDto.email,
      password: await this.hashingService.hashPassword(createUserDto.password),
      phone: createUserDto.phone,
    });

    return this.toPublicUser(user);
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, name, phone, password } = loginUserDto;

    const user = await this.authRepository.loginUser(email, name, phone);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashingService.verifyPassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.createAccessToken(user);

    return { ...this.toPublicUser(user), accessToken };
  }

  async createAccessToken(user: TokenUser): Promise<string> {
    return this.jwtService.signAsync({ userId: user.id }, { expiresIn: '1h' });
  }

  private toPublicUser(user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
    role: { name: string };
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
