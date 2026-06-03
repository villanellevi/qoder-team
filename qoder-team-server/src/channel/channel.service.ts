import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService) {}

  async findByTeam(teamId: string) {
    return this.prisma.channel.findMany({
      where: { teamId },
      include: { _count: { select: { messages: true } } },
    })
  }

  async findById(id: string) {
    return this.prisma.channel.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
  }

  async create(teamId: string, name: string, type: string, members: string[]) {
    return this.prisma.channel.create({
      data: { teamId, name, type, members },
    })
  }
}
