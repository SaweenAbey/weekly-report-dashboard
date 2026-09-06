import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReviewReportDto } from './dto/review-report.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { UserDocument } from '../users/schemas/user.schema';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.reportsService.create(createReportDto, currentUser);
  }

  @Get()
  findAll(
    @Query() queryDto: QueryReportDto,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.reportsService.findAll(queryDto, currentUser);
  }

  @Get('analytics/dashboard')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEAM_MEMBER)
  getAnalytics(@CurrentUser() currentUser: UserDocument) {
    return this.reportsService.getDashboardAnalytics(currentUser);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.reportsService.findById(id, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.reportsService.update(id, updateReportDto, currentUser);
  }

  @Post(':id/submit')
  submit(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.reportsService.submitReport(id, currentUser);
  }

  @Post(':id/review')
  @Roles(Role.ADMIN, Role.MANAGER)
  review(
    @Param('id') id: string,
    @Body() reviewReportDto: ReviewReportDto,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.reportsService.reviewReport(id, reviewReportDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.reportsService.remove(id, currentUser);
  }
}
