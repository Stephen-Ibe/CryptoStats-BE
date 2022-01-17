import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, compare } from 'bcrypt';
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

  async updateUser(userId: string, data: Partial<User>): Promise<UserResponse> {
    const user = await this.usersRepository.updateOne(userId, data);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

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

  async validateUser(email: string, password: string): Promise<UserResponse> {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(
        `User with this email, ${email} doesn't exist.`,
      );
    }
    const passwordIsValid = await compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    return this.buildResponse(user);
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const user = await this.usersRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return this.buildResponse(user);
  }

  private buildResponse(user: User): UserResponse {
    return {
      _id: user._id.toHexString(),
      email: user.email,
    };
  }
}
