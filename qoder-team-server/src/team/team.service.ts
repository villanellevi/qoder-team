import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, slug: string, userId: string) {
    return this.prisma.team.create({
      data: {
        name,
        slug,
        members: { create: { userId, role: 'owner' } },
        channels: {
          create: { name: '全员群聊', type: 'group', members: [userId] },
        },
      },
    })
  }

  async findForUser(userId: string) {
    const memberships = await this.prisma.teamMember.findMany({
      where: { userId },
      include: { team: true },
    })
    return memberships.map(m => m.team)
  }

  async findBySlug(slug: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { slug },
      include: { members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } } },
    })
    if (!team) throw new NotFoundException('Team not found')
    const isMember = team.members.some(m => m.userId === userId)
    if (!isMember) throw new NotFoundException('Team not found')
    return team
  }

  async getMembers(teamId: string) {
    const members = await this.prisma.teamMember.findMany({
      where: { teamId },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    })
    return members
  }
}
