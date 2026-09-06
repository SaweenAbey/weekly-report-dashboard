import { IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ReportStatus } from '../../common/enums/report-status.enum';

export class QueryReportDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsMongoId()
  project?: string;

  @IsOptional()
  @IsMongoId()
  author?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
