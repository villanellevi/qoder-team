import { Controller, Get, Param } from '@nestjs/common'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
  constructor(private user: UserService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.user.findById(id)
  }
}
