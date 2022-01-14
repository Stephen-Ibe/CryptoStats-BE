import { Injectable } from '@nestjs/common';
import { UserResponse } from 'src/users/dto/response/userResponse.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  async login(user: UserResponse, response: Response): Promise<void> {}
}
