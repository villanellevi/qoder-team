import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TodoService } from './todo.service'
import { TodoController } from './todo.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule, JwtModule],
  providers: [TodoService],
  controllers: [TodoController],
})
export class TodoModule {}
