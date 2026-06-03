import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from '../prisma/prisma.module'
import { AgentConfigService } from './agent-config.service'
import { AgentConfigController } from './agent-config.controller'

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [AgentConfigController],
  providers: [AgentConfigService],
  exports: [AgentConfigService],
})
export class AgentConfigModule {}
