import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class DailyReportService {
  constructor(private prisma: PrismaService) {}

  async findByTeam(teamId: string) {
    return this.prisma.dailyReport.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: any) {
    return this.prisma.dailyReport.create({ data })
  }
}
