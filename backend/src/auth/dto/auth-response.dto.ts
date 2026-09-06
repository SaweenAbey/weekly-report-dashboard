import { Role } from '../../common/enums/role.enum';

export class AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  department?: string;
}

export class AuthResponseDto {
  user: AuthUserDto;
  accessToken: string;
  expiresIn: string;
}
