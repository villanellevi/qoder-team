import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ProjectService } from './project.service'
import { ProjectController } from './project.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule, JwtModule],
  providers: [ProjectService],
  controllers: [ProjectController],
})
export class ProjectModule {}
