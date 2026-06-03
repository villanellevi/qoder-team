import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from '../prisma/prisma.module'
import { PendingService } from './pending.service'
import { PendingController } from './pending.controller'

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [PendingController],
  providers: [PendingService],
  exports: [PendingService],
})
export class PendingModule {}
