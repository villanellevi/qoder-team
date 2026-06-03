import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    channelId: string
    senderId: string
    senderType: string
    content: string
    kbRefs?: string[]
    artifact?: any
  }) {
    return this.prisma.chatMessage.create({
      data,
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    })
  }

  async findByChannel(channelId: string, skip = 0, take = 50) {
    return this.prisma.chatMessage.findMany({
      where: { channelId },
      skip,
      take,
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    })
  }
}
