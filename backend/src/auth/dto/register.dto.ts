import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn([Role.TEAM_MEMBER, Role.MANAGER], {
    message: 'Self-registration is only permitted for Team Member or Manager roles.',
  })
  role?: Role = Role.TEAM_MEMBER;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
