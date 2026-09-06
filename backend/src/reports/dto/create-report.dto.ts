import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: '65f1234567890abcdef12345', description: 'Project ID' })
  @IsMongoId()
  @IsNotEmpty()
  project: string;

  @ApiProperty({ example: '2026-09-01', description: 'Week start date (e.g. Monday)' })
  @IsDateString()
  @IsNotEmpty()
  weekStartDate: string;

  @ApiProperty({ example: '2026-09-07', description: 'Week end date (e.g. Sunday)' })
  @IsDateString()
  @IsNotEmpty()
  weekEndDate: string;

  @ApiProperty({ example: 'Completed user auth and backend API scaffolding.' })
  @IsString()
  @IsNotEmpty()
  summary: string;

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
    example: ['Integration testing with frontend', 'E2E testing'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  plansForNextWeek?: string[];

  @ApiPropertyOptional({ example: 'Waiting on design approval for review modal' })
  @IsOptional()
  @IsString()
  blockers?: string;

  @ApiPropertyOptional({ example: 38.5, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hoursLogged?: number;
}
