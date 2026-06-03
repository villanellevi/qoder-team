import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from '../prisma/prisma.module'
import { DailyReportService } from './daily-report.service'
import { DailyReportController } from './daily-report.controller'

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [DailyReportController],
  providers: [DailyReportService],
  exports: [DailyReportService],
})
export class DailyReportModule {}
