import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { TeamModule } from './team/team.module'
import { ChannelModule } from './channel/channel.module'
import { MessageModule } from './message/message.module'
import { DocumentModule } from './document/document.module'
import { GatewayModule } from './gateway/gateway.module'
import { ProjectModule } from './project/project.module'
import { TodoModule } from './todo/todo.module'
import { PendingModule } from './pending/pending.module'
import { ActivityModule } from './activity/activity.module'
import { AgentConfigModule } from './agent-config/agent-config.module'
import { DailyReportModule } from './daily-report/daily-report.module'
import { HealthModule } from './health/health.module'

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    TeamModule,
    ChannelModule,
    MessageModule,
    DocumentModule,
    GatewayModule,
    ProjectModule,
    TodoModule,
    PendingModule,
    ActivityModule,
    AgentConfigModule,
    DailyReportModule,
    HealthModule,
  ],
})
export class AppModule {}
