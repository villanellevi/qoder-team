"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const message_service_1 = require("../message/message.service");
const parseCorsOrigin = () => {
    if (process.env.FRONTEND_URL) {
        return process.env.FRONTEND_URL.split(',');
    }
    return ['http://localhost:5173', 'http://localhost:3000'];
};
let ChatGateway = class ChatGateway {
    constructor(jwt, messageService) {
        this.jwt = jwt;
        this.messageService = messageService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.toString().replace('Bearer ', '');
            if (!token)
                return client.disconnect();
            const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET });
            client.data.user = payload;
            client.join(`user:${payload.sub}`);
            this.server.emit('presence:update', Array.from(this.server.sockets.sockets.values()).map(s => ({
                userId: s.data.user?.sub,
                online: true,
            })));
        }
        catch {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.server.emit('presence:update', Array.from(this.server.sockets.sockets.values()).map(s => ({
            userId: s.data.user?.sub,
            online: true,
        })));
    }
    async handleJoin(data, client) {
        client.join(data.channelId);
        const history = await this.messageService.findByChannel(data.channelId, 0, 50);
        client.emit('channel:history', history);
    }
    handleLeave(data, client) {
        client.leave(data.channelId);
    }
    async handleMessage(data, client) {
        const msg = await this.messageService.create({
            channelId: data.channelId,
            senderId: data.senderId,
            senderType: data.senderType,
            content: data.content,
            kbRefs: data.kbRefs || [],
            artifact: data.artifact,
        });
        this.server.to(data.channelId).emit('message:new', msg);
    }
    handleTyping(data, client) {
        client.to(data.channelId).emit('typing', data);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('channel:join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('channel:leave'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:send'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: parseCorsOrigin(), credentials: true },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService, message_service_1.MessageService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map