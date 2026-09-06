import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ReportStatus } from '../../common/enums/report-status.enum';

export class QueryReportDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ReportStatus, description: 'Filter by report status' })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ description: 'Filter by project ID' })
  @IsOptional()
  @IsMongoId()
  project?: string;

  @ApiPropertyOptional({ description: 'Filter by author ID (Manager/Admin only)' })
  @IsOptional()
  @IsMongoId()
  author?: string;

  @ApiPropertyOptional({ description: 'Filter from week start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter to week end date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
