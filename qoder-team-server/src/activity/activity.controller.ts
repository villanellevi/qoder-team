import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common'
import { ActivityService } from './activity.service'
import { JwtGuard } from '../auth/jwt.guard'

@Controller('activities')
export class ActivityController {
  constructor(private activity: ActivityService) {}

  @Get()
  @UseGuards(JwtGuard)
  list(@Query('teamId') teamId: string) {
    return this.activity.findByTeam(teamId)
  }

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() dto: any) {
    return this.activity.create(dto)
  }
}
