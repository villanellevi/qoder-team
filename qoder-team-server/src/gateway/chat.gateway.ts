import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { MessageService } from '../message/message.service'

const parseCorsOrigin = () => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.split(',')
  }
  return ['http://localhost:5173', 'http://localhost:3000']
}

@WebSocketGateway({
  cors: { origin: parseCorsOrigin(), credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(private jwt: JwtService, private messageService: MessageService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.toString().replace('Bearer ', '')
      if (!token) return client.disconnect()
      const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET })
      client.data.user = payload
      client.join(`user:${payload.sub}`)
      this.server.emit('presence:update', Array.from(this.server.sockets.sockets.values()).map(s => ({
        userId: s.data.user?.sub,
        online: true,
      })))
    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    this.server.emit('presence:update', Array.from(this.server.sockets.sockets.values()).map(s => ({
      userId: s.data.user?.sub,
      online: true,
    })))
  }

  @SubscribeMessage('channel:join')
  async handleJoin(@MessageBody() data: { channelId: string }, @ConnectedSocket() client: Socket) {
    client.join(data.channelId)
    const history = await this.messageService.findByChannel(data.channelId, 0, 50)
    client.emit('channel:history', history)
  }

  @SubscribeMessage('channel:leave')
  handleLeave(@MessageBody() data: { channelId: string }, @ConnectedSocket() client: Socket) {
    client.leave(data.channelId)
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @MessageBody() data: { channelId: string; content: string; senderId: string; senderType: string; kbRefs?: string[]; artifact?: any },
    @ConnectedSocket() client: Socket,
  ) {
    const msg = await this.messageService.create({
      channelId: data.channelId,
      senderId: data.senderId,
      senderType: data.senderType,
      content: data.content,
      kbRefs: data.kbRefs || [],
      artifact: data.artifact,
    })

    this.server.to(data.channelId).emit('message:new', msg)
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: { channelId: string; userId: string; name: string }, @ConnectedSocket() client: Socket) {
    client.to(data.channelId).emit('typing', data)
  }
}
