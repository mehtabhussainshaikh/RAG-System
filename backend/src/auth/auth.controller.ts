import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { AuthService } from './auth.service.js';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    private readonly refreshTokenCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/auth',
    };

    private setRefreshTokenCookie(res: Response, refreshToken: string): void {
        res.cookie('refreshToken', refreshToken, {
            ...this.refreshTokenCookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    @Post('register')
    async registerUser(@Body() createUserDto: CreateUserDto): Promise<any> {
        return await this.authService.registerUser(createUserDto);
    }

    @Post('login')
    async loginUser(@Body() loginUserDto: LoginUserDto,
        @Res({ passthrough: true }) res: Response): Promise<any> {
        const data = await this.authService.loginUser(loginUserDto);
        const { accessToken, refreshToken, ...user } = data;

        this.setRefreshTokenCookie(res, refreshToken);
        return { ...user, accessToken };
    }


    @Post('refresh-token')
    async refreshToken(@Req() req: Request): Promise<{ accessToken: string }> {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        return this.authService.refreshAccessToken(refreshToken);
    }

    @Post('logout')
    logoutUser(@Res({ passthrough: true }) res: Response): { message: string } {
        res.clearCookie('refreshToken', this.refreshTokenCookieOptions);
        return { message: 'Logged out successfully' };
    }


}
