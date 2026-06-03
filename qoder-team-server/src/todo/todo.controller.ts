import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { TodoService } from './todo.service'
import { JwtGuard } from '../auth/jwt.guard'

@Controller('todos')
export class TodoController {
  constructor(private todo: TodoService) {}

  @Get()
  @UseGuards(JwtGuard)
  list(@Query('teamId') teamId?: string, @Query('projectId') projectId?: string) {
    if (projectId) return this.todo.findByProject(projectId)
    return this.todo.findByTeam(teamId || '')
  }

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() dto: any) {
    return this.todo.create(dto)
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.todo.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  remove(@Param('id') id: string) {
    return this.todo.remove(id)
  }
}
