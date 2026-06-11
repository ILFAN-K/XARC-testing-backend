import { Controller, Post, Get, UseGuards, Req, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Req() request: Request, @Body('role') role?: string) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({ success: false, message: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.split('Bearer ')[1];
    return this.authService.syncUser(token, role);
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  getMe(@CurrentUser() user: any) {
    return this.authService.me(user.sub);
  }
}
