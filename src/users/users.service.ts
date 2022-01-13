import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { CreateUserRequest } from './dto/request/createUserRequest.dto';
import { UserResponse } from './dto/response/userResponse.dto';
import { User } from './models/User';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(
    createUserRequest: CreateUserRequest,
  ): Promise<UserResponse> {
    const user = await this.usersRepository.insertOne({
      ...createUserRequest,
      password: await hash(createUserRequest.password, 10),
    });

    return this.buildResponse(user);
  }

  private buildResponse(user: User): UserResponse {
    return {
      _id: user._id.toHexString(),
      email: user.email,
    };
  }
}
