import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { QueryActivityLogDto } from './dto/query-activity-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll(@Query() queryDto: QueryActivityLogDto) {
    return this.activityLogsService.findAll(queryDto);
  }
}
