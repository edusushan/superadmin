import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';
import { Response } from 'express';
import { Public } from 'src/common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signIn')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) response: Response,
    @Headers('user-agent') userAgent: string,
  ): Promise<Tokens> {
    // Pass the userAgent as deviceName to the AuthService
    const tokens = await this.authService.signIn(dto, userAgent, response);

    response.cookie('access_token', tokens.access_token, {
      sameSite: 'none',
      secure: process.env.PRODUCTION === 'true',
      httpOnly: process.env.httpOnly === 'true',
      expires: new Date(Date.now() + 3600 * 1000 * 24 * 180),
    });

    response.cookie('refresh_token', tokens.refresh_token, {
      sameSite: 'none',
      secure: process.env.PRODUCTION === 'true',
      httpOnly: process.env.httpOnly === 'true',
      expires: new Date(Date.now() + 3600 * 1000 * 24 * 180),
    });

    return tokens;
  }
}
