import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch } from '@nestjs/common'
import { ProjectService } from './project.service'
import { JwtGuard } from '../auth/jwt.guard'

@Controller('projects')
export class ProjectController {
  constructor(private project: ProjectService) {}

  @Get()
  @UseGuards(JwtGuard)
  list(@Query('teamId') teamId: string) {
    return this.project.findByTeam(teamId)
  }

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() dto: { teamId: string; name: string; slug: string; desc: string; deadline: string }) {
    return this.project.create(dto)
  }

  @Patch(':id/progress')
  @UseGuards(JwtGuard)
  updateProgress(@Param('id') id: string, @Body() dto: { progress: number }) {
    return this.project.updateProgress(id, dto.progress)
  }
}
