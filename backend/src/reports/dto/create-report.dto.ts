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
  @IsMongoId()
  @IsNotEmpty()
  project: string;

  @IsDateString()
  @IsNotEmpty()
  weekStartDate: string;

  @IsDateString()
  @IsNotEmpty()
  weekEndDate: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

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
