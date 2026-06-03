import { Module } from '@nestjs/common'
import { ChannelService } from './channel.service'
import { ChannelController } from './channel.controller'
import { JwtModule } from "@nestjs/jwt"
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule, JwtModule],
  providers: [ChannelService],
  controllers: [ChannelController],
})
export class ChannelModule {}
