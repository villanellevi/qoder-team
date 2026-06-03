import { PrismaService } from '../prisma/prisma.service';
export declare class MessageService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        channelId: string;
        senderId: string;
        senderType: string;
        content: string;
        kbRefs?: string[];
        artifact?: any;
    }): Promise<{
        sender: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        channelId: string;
        senderId: string;
        senderType: string;
        content: string;
        artifact: import("@prisma/client/runtime/library").JsonValue | null;
        kbRefs: string[];
    }>;
    findByChannel(channelId: string, skip?: number, take?: number): Promise<({
        sender: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        channelId: string;
        senderId: string;
        senderType: string;
        content: string;
        artifact: import("@prisma/client/runtime/library").JsonValue | null;
        kbRefs: string[];
    })[]>;
}
