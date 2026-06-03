import { PrismaService } from '../prisma/prisma.service';
export declare class ChannelService {
    private prisma;
    constructor(prisma: PrismaService);
    findByTeam(teamId: string): Promise<({
        _count: {
            messages: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        members: string[];
        teamId: string;
        type: string;
    })[]>;
    findById(id: string): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            channelId: string;
            senderId: string;
            senderType: string;
            content: string;
            artifact: import("@prisma/client/runtime/library").JsonValue | null;
            kbRefs: string[];
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        members: string[];
        teamId: string;
        type: string;
    }>;
    create(teamId: string, name: string, type: string, members: string[]): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        members: string[];
        teamId: string;
        type: string;
    }>;
}
