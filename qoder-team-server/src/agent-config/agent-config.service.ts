import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AgentConfigService {
  constructor(private prisma: PrismaService) {}

  async findByTeam(teamId: string) {
    return this.prisma.agent.findMany({
      where: { teamId },
      include: {
        skills: true,
        memory: true,
        faq: true,
        workflows: true,
      },
    })
  }

  async findByUser(userId: string) {
    return this.prisma.agent.findMany({
      where: { userId },
      include: {
        skills: true,
        memory: true,
        faq: true,
        workflows: true,
      },
    })
  }

  async updateAgent(id: string, data: any) {
    return this.prisma.agent.update({
      where: { id },
      data,
      include: { skills: true, memory: true, faq: true, workflows: true },
    })
  }

  async upsertSkill(agentId: string, data: any) {
    if (data.id) {
      return this.prisma.agentSkill.update({ where: { id: data.id }, data: { name: data.name, desc: data.desc } })
    }
    return this.prisma.agentSkill.create({ data: { agentId, name: data.name, desc: data.desc } })
  }

  async removeSkill(id: string) {
    return this.prisma.agentSkill.delete({ where: { id } })
  }

  async upsertMemory(agentId: string, data: any) {
    if (data.id) {
      return this.prisma.agentMemory.update({ where: { id: data.id }, data: { key: data.key, value: data.value } })
    }
    return this.prisma.agentMemory.create({ data: { agentId, key: data.key, value: data.value } })
  }

  async removeMemory(id: string) {
    return this.prisma.agentMemory.delete({ where: { id } })
  }

  async upsertFAQ(agentId: string, data: any) {
    if (data.id) {
      return this.prisma.agentFAQ.update({
        where: { id: data.id },
        data: { question: data.question, answer: data.answer, likes: data.likes, dislikes: data.dislikes },
      })
    }
    return this.prisma.agentFAQ.create({
      data: { agentId, question: data.question, answer: data.answer, likes: data.likes || 0, dislikes: data.dislikes || 0 },
    })
  }

  async removeFAQ(id: string) {
    return this.prisma.agentFAQ.delete({ where: { id } })
  }

  async upsertWorkflow(agentId: string, data: any) {
    if (data.id) {
      return this.prisma.agentWorkflow.update({ where: { id: data.id }, data: { name: data.name, steps: data.steps } })
    }
    return this.prisma.agentWorkflow.create({ data: { agentId, name: data.name, steps: data.steps } })
  }

  async removeWorkflow(id: string) {
    return this.prisma.agentWorkflow.delete({ where: { id } })
  }
}
