import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { RegisterResponseDto } from './dto/register-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { Request, Response } from 'express';
import { RefreshResultDto } from './dto/refresh-result.dto.js';
import { ref } from 'process';
import { LogoutResponseDto } from './dto/logout-response.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(
    @Body() registerDto: RegisterDto
  ): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async loginUser(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const result = await this.authService.login(loginDto);

    response.cookie(
      'refresh_token',
      result.refreshToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 30
      },
    );
    return {
      accessToken: result.accessToken
    }
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({passthrough: true}) response : Response
  ): Promise<RefreshResultDto> {
    const refreshToken = request.cookies.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException(`Refresh token missing`);
    }

    const result = await this.authService.refresh(refreshToken);

    response.cookie(
      'refresh_token',
      result.refreshToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'prod',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 30
      },
    );

    return {
      accessToken: result.accessToken
    }
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({passthrough: true}) response: Response
  ): Promise<LogoutResponseDto> { 
    const refreshToken = request.cookies.refresh_token;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    response.clearCookie('refresh_token');

    return {
      message: 'Logged out successfully'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(
    @CurrentUser() user : {userId: number}
  ) {
    return user;
  }

}
