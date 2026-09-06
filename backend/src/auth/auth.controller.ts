import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserDocument } from '../users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent') || '';
    return this.authService.register(registerDto, ip, userAgent);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent') || '';
    return this.authService.login(loginDto, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: UserDocument) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: UserDocument,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent') || '';
    return this.authService.changePassword(
      user._id.toString(),
      changePasswordDto,
      ip,
      userAgent,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: UserDocument, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent') || '';
    return this.authService.logout(user, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Get('activity')
  async getActivity(@CurrentUser() user: UserDocument) {
    return this.authService.getUserActivity(user._id.toString());
  }
}
