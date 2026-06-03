import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async findByTeam(teamId: string) {
    return this.prisma.project.findMany({
      where: { teamId },
      include: {
        milestones: {
          include: { requiredArtifacts: true, gate: true },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { todos: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: { teamId: string; name: string; slug: string; desc: string; deadline: string }) {
    return this.prisma.project.create({ data })
  }

  async updateProgress(id: string, progress: number) {
    return this.prisma.project.update({ where: { id }, data: { progress } })
  }
}
