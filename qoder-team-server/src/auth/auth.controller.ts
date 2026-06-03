import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common'
import { IsString, IsEmail } from 'class-validator'
import { AuthService } from './auth.service'
import { JwtGuard } from './jwt.guard'
import { CurrentUser } from './current-user.decorator'

export class RegisterDto {
  @IsEmail()
  email: string
  @IsString()
  password: string
  @IsString()
  name: string
}

export class LoginDto {
  @IsEmail()
  email: string
  @IsString()
  password: string
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password, dto.name)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password)
  }

  @Get('me')
  @UseGuards(JwtGuard)
  me(@CurrentUser('sub') userId: string) {
    return this.auth.me(userId)
  }
}
