import { CreateUserRequest } from './dto/createUserRequest.dto';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(createUserRequest: CreateUserRequest): Promise<any> {
    return this.usersRepository.insertOne(createUserRequest);
  }
}
