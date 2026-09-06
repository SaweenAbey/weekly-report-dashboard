import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../activity-logs/schemas/activity-log.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async register(
    registerDto: RegisterDto,
    ip?: string,
    userAgent?: string,
  ): Promise<{ message: string; isApproved: boolean; user: any }> {
    const user = await this.usersService.create({
      ...registerDto,
      role: registerDto.role || Role.TEAM_MEMBER,
      isApproved: false, // Must be approved by an Admin
    });

    await this.activityLogsService.log({
      user: user._id.toString(),
      action: ActivityAction.USER_REGISTER,
      description: `New user registration (Pending Approval): ${user.name} (${user.email}) as ${user.role}`,
      ip,
      userAgent,
      metadata: { role: user.role, department: user.department, isApproved: false },
    });

    return {
      message:
        'Account registered successfully. Your account is pending administrator approval before you can log in.',
      isApproved: false,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isApproved: false,
      },
    };
  }

  async login(
    loginDto: LoginDto,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isApproved) {
      throw new UnauthorizedException(
        'Your account is pending administrator approval. You cannot log in until an administrator approves your account.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.activityLogsService.log({
      user: user._id.toString(),
      action: ActivityAction.USER_LOGIN,
      description: `User logged in: ${user.name} (${user.email})`,
      ip,
      userAgent,
    });

    return this.generateTokenResponse(user);
  }

  async logout(
    user: UserDocument,
    ip?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    await this.activityLogsService.log({
      user: user._id.toString(),
      action: ActivityAction.USER_LOGOUT,
      description: `User logged out: ${user.name}`,
      ip,
      userAgent,
    });

    return { message: 'Logged out successfully' };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
    ip?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    // Need full user with password
    const user = await this.usersService.findByEmail(
      (await this.usersService.findById(userId)).email,
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Current password does not match');
    }

    await this.usersService.update(userId, {
      password: changePasswordDto.newPassword,
    });

    await this.activityLogsService.log({
      user: userId,
      action: ActivityAction.PASSWORD_CHANGED,
      description: `Password updated successfully for ${user.email}`,
      ip,
      userAgent,
    });

    return { message: 'Password changed successfully' };
  }

  async getProfile(userId: string): Promise<UserDocument> {
    return this.usersService.findById(userId);
  }

  async getUserActivity(userId: string) {
    return this.activityLogsService.findByUser(userId, 15);
  }

  private generateTokenResponse(user: UserDocument): AuthResponseDto {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    const userDto: AuthUserDto = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      department: user.department,
    };

    return {
      user: userDto,
      accessToken: token,
      expiresIn: '7d',
    };
  }
}
