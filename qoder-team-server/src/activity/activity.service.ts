import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async findByTeam(teamId: string) {
    return this.prisma.activityItem.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async create(data: any) {
    return this.prisma.activityItem.create({ data })
  }
}
