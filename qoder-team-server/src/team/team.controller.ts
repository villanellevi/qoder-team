import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { TeamService } from './team.service'
import { JwtGuard } from '../auth/jwt.guard'
import { CurrentUser } from '../auth/current-user.decorator'

export class CreateTeamDto {
  name: string
  slug: string
}

@Controller('teams')
export class TeamController {
  constructor(private team: TeamService) {}

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() dto: CreateTeamDto, @CurrentUser('sub') userId: string) {
    return this.team.create(dto.name, dto.slug, userId)
  }

  @Get()
  @UseGuards(JwtGuard)
  list(@CurrentUser('sub') userId: string) {
    return this.team.findForUser(userId)
  }

  @Get(':slug')
  @UseGuards(JwtGuard)
  get(@Param('slug') slug: string, @CurrentUser('sub') userId: string) {
    return this.team.findBySlug(slug, userId)
  }

  @Get(':id/members')
  @UseGuards(JwtGuard)
  members(@Param('id') teamId: string) {
    return this.team.getMembers(teamId)
  }

  @Get('invitations/me')
  @UseGuards(JwtGuard)
  myInvitations(@CurrentUser('sub') userId: string) {
    return this.team.getPendingInvitations(userId)
  }

  @Post('invitations/:code/accept')
  @UseGuards(JwtGuard)
  acceptInvitation(@Param('code') code: string, @CurrentUser('sub') userId: string) {
    return this.team.acceptInvitation(code, userId)
  }
}
