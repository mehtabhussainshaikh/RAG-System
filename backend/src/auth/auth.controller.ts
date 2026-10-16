import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async registerUser(@Body() createUserDto: CreateUserDto): Promise<any> {
        return await this.authService.registerUser(createUserDto);
    }

    @Post('login')
    async loginUser(@Body() loginUserDto: LoginUserDto): Promise<any> {
        return await this.authService.loginUser(loginUserDto);
    }
}
