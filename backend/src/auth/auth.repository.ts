import { Injectable } from '@nestjs/common';
import { PrismaService } from "../common/prisma/prisma.service.js";
import { CreateUserDto } from './dto/create.user.dto.js';

@Injectable()
export class AuthRepository {
    constructor(private readonly prisma: PrismaService) { }

    createUser(user: CreateUserDto): Promise<any> {
        return this.prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: user.password,
                phone: user.phone,
                roleId: user.role,
            },
        });
    }


    loginUser(email: string, name: string, phone: string): Promise<any> {
        return this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { name: name },
                    { phone: phone }
                ]
            }
        });
    }

    findUserByEmail(email: string): Promise<any> {
        return this.prisma.user.findUnique({
            where: { email: email },
        });
    }
}
