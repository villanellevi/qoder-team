import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch, Delete } from '@nestjs/common'
import { AgentConfigService } from './agent-config.service'
import { JwtGuard } from '../auth/jwt.guard'

@Controller('agents')
export class AgentConfigController {
  constructor(private agentConfig: AgentConfigService) {}

  @Get()
  @UseGuards(JwtGuard)
  list(@Query('teamId') teamId: string, @Query('userId') userId: string) {
    if (teamId) return this.agentConfig.findByTeam(teamId)
    if (userId) return this.agentConfig.findByUser(userId)
    return []
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  updateAgent(@Param('id') id: string, @Body() dto: any) {
    return this.agentConfig.updateAgent(id, dto)
  }

  @Post(':id/skills')
  @UseGuards(JwtGuard)
  upsertSkill(@Param('id') agentId: string, @Body() dto: any) {
    return this.agentConfig.upsertSkill(agentId, dto)
  }

  @Delete('skills/:skillId')
  @UseGuards(JwtGuard)
  removeSkill(@Param('skillId') id: string) {
    return this.agentConfig.removeSkill(id)
  }

  @Post(':id/memory')
  @UseGuards(JwtGuard)
  upsertMemory(@Param('id') agentId: string, @Body() dto: any) {
    return this.agentConfig.upsertMemory(agentId, dto)
  }

  @Delete('memory/:memoryId')
  @UseGuards(JwtGuard)
  removeMemory(@Param('memoryId') id: string) {
    return this.agentConfig.removeMemory(id)
  }

  @Post(':id/faq')
  @UseGuards(JwtGuard)
  upsertFAQ(@Param('id') agentId: string, @Body() dto: any) {
    return this.agentConfig.upsertFAQ(agentId, dto)
  }

  @Delete('faq/:faqId')
  @UseGuards(JwtGuard)
  removeFAQ(@Param('faqId') id: string) {
    return this.agentConfig.removeFAQ(id)
  }

  @Post(':id/workflows')
  @UseGuards(JwtGuard)
  upsertWorkflow(@Param('id') agentId: string, @Body() dto: any) {
    return this.agentConfig.upsertWorkflow(agentId, dto)
  }

  @Delete('workflows/:workflowId')
  @UseGuards(JwtGuard)
  removeWorkflow(@Param('workflowId') id: string) {
    return this.agentConfig.removeWorkflow(id)
  }
}
