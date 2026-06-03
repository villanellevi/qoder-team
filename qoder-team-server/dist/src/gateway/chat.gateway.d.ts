import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from '../message/message.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwt;
    private messageService;
    server: Server;
    constructor(jwt: JwtService, messageService: MessageService);
    handleConnection(client: Socket): Promise<Socket<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>>;
    handleDisconnect(client: Socket): void;
    handleJoin(data: {
        channelId: string;
    }, client: Socket): Promise<void>;
    handleLeave(data: {
        channelId: string;
    }, client: Socket): void;
    handleMessage(data: {
        channelId: string;
        content: string;
        senderId: string;
        senderType: string;
        kbRefs?: string[];
        artifact?: any;
    }, client: Socket): Promise<void>;
    handleTyping(data: {
        channelId: string;
        userId: string;
        name: string;
    }, client: Socket): void;
}
