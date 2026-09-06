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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new weekly report (Draft)' })
  @ApiResponse({ status: 201, description: 'Report successfully created' })
  create(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.reportsService.create(createReportDto, currentUser);
  }

  @Get()
  @ApiOperation({
    summary:
      'List weekly reports with pagination, status filtering, date range & search. Strict RBAC enforced.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of reports' })
  findAll(
    @Query() queryDto: QueryReportDto,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.reportsService.findAll(queryDto, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report details by ID (Scoped to author/manager/admin)' })
  @ApiResponse({ status: 200, description: 'Report details' })
  @ApiResponse({ status: 403, description: 'Forbidden access to another user report' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.reportsService.findById(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update weekly report (Author in DRAFT or CHANGES_REQUESTED mode)' })
  @ApiResponse({ status: 200, description: 'Report updated' })
  @ApiResponse({ status: 400, description: 'Cannot edit submitted/approved report' })
  update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.reportsService.update(id, updateReportDto, currentUser);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit report for manager review' })
  @ApiResponse({ status: 200, description: 'Report submitted' })
  submit(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.reportsService.submitReport(id, currentUser);
  }

  @Post(':id/review')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary:
      'Review report (Approve, Request Changes, Reject) with feedback comments (Manager/Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Report review recorded in review history' })
  @ApiResponse({ status: 403, description: 'Manager role required' })
  review(
    @Param('id') id: string,
    @Body() reviewReportDto: ReviewReportDto,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.reportsService.reviewReport(id, reviewReportDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete report (Author draft or Admin)' })
  @ApiResponse({ status: 204, description: 'Report deleted' })
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.reportsService.remove(id, currentUser);
  }
}
