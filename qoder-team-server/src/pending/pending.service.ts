import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PendingService {
  constructor(private prisma: PrismaService) {}

  async findByTeam(teamId: string) {
    return this.prisma.pendingItem.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: any) {
    return this.prisma.pendingItem.create({ data })
  }

  async update(id: string, data: any) {
    return this.prisma.pendingItem.update({ where: { id }, data })
  }

  async remove(id: string) {
    return this.prisma.pendingItem.delete({ where: { id } })
  }
}
