import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class CoinbaseService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
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

    this.getTokensFromCode(code as string).subscribe(
      async (tokenResponse) => {},
    );
  }
}
