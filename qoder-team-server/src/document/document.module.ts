import { Module } from '@nestjs/common'
import { DocumentService } from './document.service'
import { DocumentController } from './document.controller'
import { JwtModule } from "@nestjs/jwt"
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule, JwtModule],
  providers: [DocumentService],
  controllers: [DocumentController],
})
export class DocumentModule {}
