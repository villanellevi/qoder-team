import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(email: string, password: string, name: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) throw new UnauthorizedException('Email already exists')

    const hash = await bcrypt.hash(password, 10)
    const user = await this.prisma.user.create({
      data: { email, name, password: hash },
    })

    const token = this.jwt.sign({ sub: user.id, email: user.email })
    return { token, user: { id: user.id, email: user.email, name: user.name } }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    const token = this.jwt.sign({ sub: user.id, email: user.email })
    return { token, user: { id: user.id, email: user.email, name: user.name } }
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatar: true, role: true },
    })
  }
}
