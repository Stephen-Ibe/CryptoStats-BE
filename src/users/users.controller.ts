import { UserResponse } from './dto/response/userResponse.dto';
import { UsersService } from './users.service';
import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserRequest } from './dto/request/createUserRequest.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async createUser(
    @Body() createUserRequest: CreateUserRequest,
  ): Promise<UserResponse> {
    return this.userService.createUser(createUserRequest);
  }
}
