import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { RegisterResponseDto } from './dto/register-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { CookieOptions, Request, Response } from 'express';
import { RefreshResultDto } from './dto/refresh-result.dto.js';
import { ref } from 'process';
import { LogoutResponseDto } from './dto/logout-response.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  

  private getRefreshCookieClearOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth',
    };
  }

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
      this.getRefreshCookieClearOptions(),
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
      this.getRefreshCookieClearOptions(),
    );

    return {
      accessToken: result.accessToken
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<LogoutResponseDto> { 
    const refreshToken = request.cookies.refresh_token;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    response.clearCookie(
      'refresh_token',
      this.getRefreshCookieClearOptions(),
    );

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

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(
    @CurrentUser() user: {userId: number},
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    await this.authService.logoutAll(
      user.userId
    );

    response.clearCookie(
      'refresh_token',
      this.getRefreshCookieClearOptions(),
    );
  }

  @Post('verify-email')
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto
  ): Promise<void> {
    return this.authService.verifyEmail(
      verifyEmailDto
    );
  }

}
