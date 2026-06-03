import { ChannelService } from './channel.service';
export declare class CreateChannelDto {
    name: string;
    type: string;
    members?: string[];
}
export declare class ChannelController {
    private channel;
    constructor(channel: ChannelService);
    list(teamId: string): Promise<({
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
    get(id: string): Promise<{
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
    create(dto: CreateChannelDto & {
        teamId: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        members: string[];
        teamId: string;
        type: string;
    }>;
}
