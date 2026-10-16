import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto/create.user.dto.js';
import { HashingServiceTsService } from '../common/hashing/hashing.service.ts/hashing.service.ts.service.js';
import { AuthRepository } from './auth.repository.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly hashingService: HashingServiceTsService,
        private readonly authRepository: AuthRepository
    ) {}

    async registerUser( createUserDto: CreateUserDto ): Promise<any> {
        
        const user =  await this.authRepository.createUser({
            name: createUserDto.name,
            email: createUserDto.email,
            password: await this.hashingService.hashPassword(createUserDto.password),
            phone: createUserDto.phone,
            role: createUserDto.role,
        })
        delete user.password;
        return user;
    }
}
