import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from '../prisma/prisma.module'
import { ActivityService } from './activity.service'
import { ActivityController } from './activity.controller'

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
