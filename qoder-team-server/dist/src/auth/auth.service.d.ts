import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(email: string, password: string, name: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    me(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        avatar: string;
        role: string;
    }>;
}
