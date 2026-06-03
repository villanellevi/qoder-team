import { PrismaService } from '../prisma/prisma.service';
export declare class ActivityService {
    private prisma;
    constructor(prisma: PrismaService);
    findByTeam(teamId: string): Promise<{
        id: string;
        teamId: string | null;
        icon: string;
        text: string;
        time: string;
        type: string;
        createdAt: Date;
    }[]>;
    create(data: any): Promise<{
        id: string;
        teamId: string | null;
        icon: string;
        text: string;
        time: string;
        type: string;
        createdAt: Date;
    }>;
}
