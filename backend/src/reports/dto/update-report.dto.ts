import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateReportDto {
  @ApiPropertyOptional({ example: '65f1234567890abcdef12345' })
  @IsOptional()
  @IsMongoId()
  project?: string;

  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsOptional()
  @IsDateString()
  weekStartDate?: string;

  @ApiPropertyOptional({ example: '2026-09-07' })
  @IsOptional()
  @IsDateString()
  weekEndDate?: string;

  @ApiPropertyOptional({ example: 'Updated weekly progress details' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Implemented JWT strategy', 'Added Mongoose schemas for reports'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tasksCompleted?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Building frontend dashboard UI'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tasksInProgress?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Integration testing with frontend'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  plansForNextWeek?: string[];

  @ApiPropertyOptional({ example: 'None' })
  @IsOptional()
  @IsString()
  blockers?: string;

  @ApiPropertyOptional({ example: 40, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hoursLogged?: number;
}
