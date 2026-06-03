import { PrismaService } from '../prisma/prisma.service';
export declare class DocumentService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        teamId: string;
        authorId: string;
        title: string;
        content: string;
        source: string;
        tags?: string[];
    }): Promise<{
        id: string;
        createdAt: Date;
        teamId: string;
        content: string;
        title: string;
        source: string;
        tags: string[];
        updatedAt: Date;
        authorId: string;
    }>;
    findByTeam(teamId: string, source?: string): Promise<({
        author: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        teamId: string;
        content: string;
        title: string;
        source: string;
        tags: string[];
        updatedAt: Date;
        authorId: string;
    })[]>;
    findById(id: string): Promise<{
        author: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        teamId: string;
        content: string;
        title: string;
        source: string;
        tags: string[];
        updatedAt: Date;
        authorId: string;
    }>;
    update(id: string, data: Partial<{
        title: string;
        content: string;
        source: string;
        tags: string[];
    }>): Promise<{
        author: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        teamId: string;
        content: string;
        title: string;
        source: string;
        tags: string[];
        updatedAt: Date;
        authorId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        teamId: string;
        content: string;
        title: string;
        source: string;
        tags: string[];
        updatedAt: Date;
        authorId: string;
    }>;
}
