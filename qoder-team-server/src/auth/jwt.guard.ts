import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException()

    try {
      const token = auth.slice(7)
      req.user = this.jwt.verify(token, { secret: process.env.JWT_SECRET })
      return true
    } catch {
      throw new UnauthorizedException()
    }
  }
}
