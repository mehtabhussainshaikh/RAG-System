import { IsEmail, IsNotEmpty, IsString , IsOptional } from 'class-validator';

export class LoginUserDto {
    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    name: string;
    

    @IsString()
    @IsOptional()
    phone: string;
    
    @IsString()
    @IsNotEmpty()
    password: string;
}
