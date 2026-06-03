import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async findByTeam(teamId: string) {
    return this.prisma.todo.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByProject(projectId: string) {
    return this.prisma.todo.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: any) {
    return this.prisma.todo.create({ data })
  }

  async update(id: string, data: any) {
    return this.prisma.todo.update({ where: { id }, data })
  }

  async remove(id: string) {
    return this.prisma.todo.delete({ where: { id } })
  }
}
