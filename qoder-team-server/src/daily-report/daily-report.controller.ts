import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common'
import { DailyReportService } from './daily-report.service'
import { JwtGuard } from '../auth/jwt.guard'

@Controller('daily-reports')
export class DailyReportController {
  constructor(private dailyReport: DailyReportService) {}

  @Get()
  @UseGuards(JwtGuard)
  list(@Query('teamId') teamId: string) {
    return this.dailyReport.findByTeam(teamId)
  }

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() dto: any) {
    return this.dailyReport.create(dto)
  }
}
