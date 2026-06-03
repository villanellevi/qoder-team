import { PrismaService } from '../prisma/prisma.service';
export declare class TeamService {
    private prisma;
    constructor(prisma: PrismaService);
    create(name: string, slug: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
    }>;
    findForUser(userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
    }[]>;
    findBySlug(slug: string, userId: string): Promise<{
        members: ({
            user: {
                id: string;
                email: string;
                name: string;
                avatar: string;
            };
        } & {
            id: string;
            role: string;
            userId: string;
            teamId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
    }>;
    getMembers(teamId: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        role: string;
        userId: string;
        teamId: string;
    })[]>;
}
