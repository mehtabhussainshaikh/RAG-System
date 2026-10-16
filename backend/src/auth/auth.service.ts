import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto.js';
import { HashingServiceTsService } from '../common/hashing/hashing.service.ts/hashing.service.ts.service.js';
import { AuthRepository } from './auth.repository.js';
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";


interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    phone: string;
    roleId: number;
}

@Injectable()
export class AuthService {

    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly hashingService: HashingServiceTsService,
        private readonly authRepository: AuthRepository,
        private readonly jwtService: JwtService,
    ) { }

    async registerUser(createUserDto: CreateUserDto): Promise<any> {
        const isUserExists = await this.authRepository.findUserByEmail(createUserDto.email);

        if (isUserExists) {
            throw new Error('User with this email already exists');
        }

        const user = await this.authRepository.createUser({
            name: createUserDto.name,
            email: createUserDto.email,
            password: await this.hashingService.hashPassword(createUserDto.password),
            phone: createUserDto.phone,
            role: createUserDto.role,
        });

        delete user.password;
        return user;
    }

    async loginUser(loginUserDto: any): Promise<any> {
        const { email, name, phone, password } = loginUserDto;

        const user = await this.authRepository.loginUser(email, name, phone);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await this.hashingService.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        const accessToken = await this.createAccess_token(user);

        delete user.password;
        return { ...user, accessToken };
    }

    async createAccess_token(user: User): Promise<string> {
        return this.jwtService.signAsync({ userId: user.id } , { expiresIn: '1h' });
    }
}
