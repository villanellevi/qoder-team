import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common'
import { MessageService } from './message.service'
import { JwtGuard } from '../auth/jwt.guard'

export class CreateMessageDto {
  channelId: string
  senderId: string
  senderType: string
  content: string
  kbRefs?: string[]
  artifact?: any
}

@Controller('messages')
export class MessageController {
  constructor(private message: MessageService) {}

  @Get()
  @UseGuards(JwtGuard)
  list(@Query('channelId') channelId: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.message.findByChannel(channelId, Number(skip || 0), Number(take || 50))
  }

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() dto: CreateMessageDto) {
    return this.message.create(dto)
  }
}
