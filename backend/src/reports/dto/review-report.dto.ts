import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ReportStatus } from '../../common/enums/report-status.enum';

export class ReviewReportDto {
  @IsEnum(ReportStatus)
  @IsNotEmpty()
  status: ReportStatus;

  @IsString()
  @IsNotEmpty()
  comment: string;
}
