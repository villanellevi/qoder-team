import { PrismaService } from '../prisma/prisma.service';
export declare class DailyReportService {
    private prisma;
    constructor(prisma: PrismaService);
    findByTeam(teamId: string): Promise<{
        id: string;
        teamId: string | null;
        memberId: string;
        date: string;
        done: string[];
        todo: string[];
        blockers: string[];
        humanFocus: string[];
        agentFocus: string[];
        createdAt: Date;
    }[]>;
    create(data: any): Promise<{
        id: string;
        teamId: string | null;
        memberId: string;
        date: string;
        done: string[];
        todo: string[];
        blockers: string[];
        humanFocus: string[];
        agentFocus: string[];
        createdAt: Date;
    }>;
}
