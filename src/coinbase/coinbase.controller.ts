import { CoinbaseService } from './coinbase.service';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';

@Controller('coinbase')
export class CoinbaseController {
  constructor(private readonly coinbaseService: CoinbaseService) {}

  @Get('auth')
  @UseGuards(JwtAuthGuard)
  authorize(@Res() response: Response): void {
    this.coinbaseService.authorize(response);
  }

  @Get('auth/callback')
  @UseGuards(JwtAuthGuard)
  handleCallback(@Res() request: Request, @Res() response: Response): void {
    this.coinbaseService.handleCallback(request, response);
  }
}
