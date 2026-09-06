import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ReportStatus } from '../../common/enums/report-status.enum';

export class ReviewReportDto {
  @ApiProperty({
    enum: [
      ReportStatus.APPROVED,
      ReportStatus.CHANGES_REQUESTED,
      ReportStatus.REJECTED,
      ReportStatus.UNDER_REVIEW,
    ],
    example: ReportStatus.APPROVED,
    description: 'New status assigned by reviewer',
  })
  @IsEnum(ReportStatus)
  @IsNotEmpty()
  status: ReportStatus;

  @ApiProperty({
    example: 'Great progress this week! All milestone objectives met.',
    description: 'Reviewer comments and feedback',
  })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
