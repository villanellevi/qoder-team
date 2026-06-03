import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch, Delete } from '@nestjs/common'
import { PendingService } from './pending.service'
import { JwtGuard } from '../auth/jwt.guard'

@Controller('pending')
export class PendingController {
  constructor(private pending: PendingService) {}

  @Get()
  @UseGuards(JwtGuard)
  list(@Query('teamId') teamId: string) {
    return this.pending.findByTeam(teamId)
  }

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() dto: any) {
    return this.pending.create(dto)
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.pending.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  remove(@Param('id') id: string) {
    return this.pending.remove(id)
  }
}
