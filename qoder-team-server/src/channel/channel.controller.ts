import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common'
import { ChannelService } from './channel.service'
import { JwtGuard } from '../auth/jwt.guard'

export class CreateChannelDto {
  name: string
  type: string
  members?: string[]
}

@Controller('channels')
export class ChannelController {
  constructor(private channel: ChannelService) {}

  @Get()
  @UseGuards(JwtGuard)
  list(@Query('teamId') teamId: string) {
    return this.channel.findByTeam(teamId)
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  get(@Param('id') id: string) {
    return this.channel.findById(id)
  }

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() dto: CreateChannelDto & { teamId: string }) {
    return this.channel.create(dto.teamId, dto.name, dto.type, dto.members || [])
  }
}
