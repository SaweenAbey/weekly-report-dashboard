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
  @IsOptional()
  @IsMongoId()
  project?: string;

  @IsOptional()
  @IsDateString()
  weekStartDate?: string;

  @IsOptional()
  @IsDateString()
  weekEndDate?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tasksCompleted?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tasksInProgress?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  plansForNextWeek?: string[];

  @IsOptional()
  @IsString()
  blockers?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hoursLogged?: number;
}
