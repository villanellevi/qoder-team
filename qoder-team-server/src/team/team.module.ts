import { Module } from '@nestjs/common'
import { TeamService } from './team.service'
import { TeamController } from './team.controller'
import { JwtModule } from "@nestjs/jwt"
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule, JwtModule],
  providers: [TeamService],
  controllers: [TeamController],
})
export class TeamModule {}
