import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(data: { teamId: string; authorId: string; title: string; content: string; source: string; tags?: string[] }) {
    return this.prisma.document.create({ data })
  }

  async findByTeam(teamId: string, source?: string) {
    return this.prisma.document.findMany({
      where: { teamId, ...(source ? { source } : {}) },
      orderBy: { updatedAt: 'desc' },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    })
  }

  async findById(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    })
  }

  async update(id: string, data: Partial<{ title: string; content: string; source: string; tags: string[] }>) {
    return this.prisma.document.update({
      where: { id },
      data,
      include: { author: { select: { id: true, name: true, avatar: true } } },
    })
  }

  async remove(id: string) {
    return this.prisma.document.delete({ where: { id } })
  }
}
