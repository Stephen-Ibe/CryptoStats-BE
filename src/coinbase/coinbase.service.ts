import { UsersService } from './../users/users.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { EncryptionService } from 'src/auth/encryption.service';
import { UserResponse } from 'src/users/dto/response/userResponse.dto';

@Injectable()
export class CoinbaseService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly usersService: UsersService,
    private readonly encryptionService: EncryptionService,
  ) {}

  private buildAuthorizeUrl() {
    const authorizeUrl = new URL('https://coinbase.com.oauth/authorize');
    authorizeUrl.searchParams.append('response_type', 'code');
    authorizeUrl.searchParams.append(
      'client_id',
      this.configService.get('COINBASE_CLIENT_ID'),
    );
    authorizeUrl.searchParams.append(
      'redirect_uri',
      this.configService.get('COINBASE_REDIRECT_URI'),
    );
    authorizeUrl.searchParams.append(
      'scope',
      'wallet:transaction:read,wallet:accounts:read',
    );

    return authorizeUrl;
  }

  public authorize(response: Response): void {
    response.redirect(this.buildAuthorizeUrl().href);
    return;
  }

  public getTokensFromCode(code: string) {
    return this.httpService.post('https://api.coinbase.com/oauth/token', {
      grant_type: 'authorization_code',
      code,
      client_id: this.configService.get('COINBASE_CLIENT_ID'),
      client_service: this.configService.get('COINBASE_CLIENT_SECRET'),
      redirect_uri: this.configService.get('COINBASE_REDIRECT_URI'),
    });
  }

  public handleCallback(req: Request, res: Response): void {
    const { code } = req.query;
    const { user } = req;

    this.getTokensFromCode(code as string).subscribe(async (tokenResponse) => {
      await this.updateUserCoinbaseAuth(
        tokenResponse.data,
        (user as unknown as UserResponse)._id,
      );
      res.redirect(this.configService.get('AUTH_REDIRECT_URI'));
    });
  }

  private async updateUserCoinbaseAuth(tokenPayload: any, userId: string) {
    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
    } = tokenPayload;

    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + expiresIn);
    await this.usersService.updateUser(userId, {
      coinbaseAuth: {
        accessToken: this.encryptionService.encrypt(accessToken),
        refreshToken: this.encryptionService.encrypt(refreshToken),
        expires,
      },
    });
  }
}
