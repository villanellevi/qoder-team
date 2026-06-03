import { Module } from '@nestjs/common'
import { ChatGateway } from './chat.gateway'
import { MessageModule } from '../message/message.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [MessageModule, JwtModule.register({
    secret: process.env.JWT_SECRET || 'qoder-team-dev-secret',
  })],
  providers: [ChatGateway],
})
export class GatewayModule {}
