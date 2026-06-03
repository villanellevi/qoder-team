import { MessageService } from './message.service';
export declare class CreateMessageDto {
    channelId: string;
    senderId: string;
    senderType: string;
    content: string;
    kbRefs?: string[];
    artifact?: any;
}
export declare class MessageController {
    private message;
    constructor(message: MessageService);
    list(channelId: string, skip?: string, take?: string): Promise<({
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
    create(dto: CreateMessageDto): Promise<{
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
}
