import { BadRequestException, Injectable } from '@nestjs/common';
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
    await this.validateCreateUserRequest(createUserRequest);
    const user = await this.usersRepository.insertOne({
      ...createUserRequest,
      password: await hash(createUserRequest.password, 10),
    });

    return this.buildResponse(user);
  }

  private async validateCreateUserRequest(
    createUserRequest: CreateUserRequest,
  ): Promise<void> {
    const user = await this.usersRepository.findOneByEmail(
      createUserRequest.email,
    );
    if (user) {
      throw new BadRequestException('Email already exist');
    }
  }

  private buildResponse(user: User): UserResponse {
    return {
      _id: user._id.toHexString(),
      email: user.email,
    };
  }
}
