import { PrismaService } from '../prisma/prisma.service';
export declare class PendingService {
    private prisma;
    constructor(prisma: PrismaService);
    findByTeam(teamId: string): Promise<{
        id: string;
        teamId: string | null;
        title: string;
        desc: string;
        assigner: string;
        assignerType: string;
        assignerIcon: string | null;
        status: string;
        context: string | null;
        relatedMember: string | null;
        createdAt: Date;
    }[]>;
    create(data: any): Promise<{
        id: string;
        teamId: string | null;
        title: string;
        desc: string;
        assigner: string;
        assignerType: string;
        assignerIcon: string | null;
        status: string;
        context: string | null;
        relatedMember: string | null;
        createdAt: Date;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        teamId: string | null;
        title: string;
        desc: string;
        assigner: string;
        assignerType: string;
        assignerIcon: string | null;
        status: string;
        context: string | null;
        relatedMember: string | null;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        teamId: string | null;
        title: string;
        desc: string;
        assigner: string;
        assignerType: string;
        assignerIcon: string | null;
        status: string;
        context: string | null;
        relatedMember: string | null;
        createdAt: Date;
    }>;
}
