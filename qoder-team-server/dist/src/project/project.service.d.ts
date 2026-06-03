import { PrismaService } from '../prisma/prisma.service';
export declare class ProjectService {
    private prisma;
    constructor(prisma: PrismaService);
    findByTeam(teamId: string): Promise<({
        milestones: ({
            requiredArtifacts: {
                id: string;
                name: string;
                status: string;
                milestoneId: string;
                type: string;
                author: string | null;
                completedAt: string | null;
                docId: string | null;
            }[];
            gate: {
                id: string;
                name: string;
                milestoneId: string;
                passed: boolean;
            };
        } & {
            id: string;
            name: string;
            status: string;
            createdAt: Date;
            projectId: string;
            date: string;
            owner: string;
        })[];
        _count: {
            todos: number;
        };
    } & {
        id: string;
        teamId: string;
        name: string;
        slug: string;
        status: string;
        progress: number;
        desc: string;
        deadline: string;
        createdAt: Date;
    })[]>;
    create(data: {
        teamId: string;
        name: string;
        slug: string;
        desc: string;
        deadline: string;
    }): Promise<{
        id: string;
        teamId: string;
        name: string;
        slug: string;
        status: string;
        progress: number;
        desc: string;
        deadline: string;
        createdAt: Date;
    }>;
    updateProgress(id: string, progress: number): Promise<{
        id: string;
        teamId: string;
        name: string;
        slug: string;
        status: string;
        progress: number;
        desc: string;
        deadline: string;
        createdAt: Date;
    }>;
}
