import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TaskItemDto,
  BlockerItemDto,
  AchievementItemDto,
  HoursBreakdownDto,
} from './create-report.dto';

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
  @ValidateNested({ each: true })
  @Type(() => TaskItemDto)
  tasks?: TaskItemDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  plansForNextWeek?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockerItemDto)
  blockersList?: BlockerItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AchievementItemDto)
  achievementsList?: AchievementItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => HoursBreakdownDto)
  hoursBreakdown?: HoursBreakdownDto;

  @IsOptional()
  @IsString()
  notesOrLinks?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hoursLogged?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tasksCompleted?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tasksInProgress?: string[];

  @IsOptional()
  @IsString()
  blockers?: string;
}
