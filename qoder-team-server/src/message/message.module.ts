import { Module } from '@nestjs/common'
import { MessageService } from './message.service'
import { MessageController } from './message.controller'
import { JwtModule } from "@nestjs/jwt"
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule, JwtModule],
  providers: [MessageService],
  controllers: [MessageController],
  exports: [MessageService],
})
export class MessageModule {}
