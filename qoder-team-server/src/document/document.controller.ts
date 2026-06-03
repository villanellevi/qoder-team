import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { DocumentService } from './document.service'
import { JwtGuard } from '../auth/jwt.guard'
import { CurrentUser } from '../auth/current-user.decorator'

export class CreateDocDto {
  teamId: string
  title: string
  content: string
  source: string
  tags?: string[]
}

export class UpdateDocDto {
  title?: string
  content?: string
  source?: string
  tags?: string[]
}

@Controller('documents')
export class DocumentController {
  constructor(private doc: DocumentService) {}

  @Get()
  @UseGuards(JwtGuard)
  list(@Query('teamId') teamId: string, @Query('source') source?: string) {
    return this.doc.findByTeam(teamId, source)
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  get(@Param('id') id: string) {
    return this.doc.findById(id)
  }

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() dto: CreateDocDto, @CurrentUser('sub') userId: string) {
    return this.doc.create({ ...dto, authorId: userId })
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  update(@Param('id') id: string, @Body() dto: UpdateDocDto) {
    return this.doc.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  remove(@Param('id') id: string) {
    return this.doc.remove(id)
  }
}
