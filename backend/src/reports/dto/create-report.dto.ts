import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TaskItemDto {
  @IsString()
  @IsNotEmpty()
  taskName: string;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  plannedPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  actualPercent?: number;

  @IsOptional()
  @IsIn(['COMPLETED', 'IN_PROGRESS', 'BLOCKED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  plannedHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  actualHours?: number;

  @IsOptional()
  @IsString()
  outputDeliverable?: string;
}

export class BlockerItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsBoolean()
  isKeyIssue?: boolean;
}

export class AchievementItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsBoolean()
  isKeyAchievement?: boolean;
}

export class HoursBreakdownDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  development?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  testing?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  meetings?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  documentation?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  other?: number;
}

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

  // Task-level table
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskItemDto)
  tasks?: TaskItemDto[];

  // Planned for next week
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  plansForNextWeek?: string[];

  // Blockers list with key issue flag
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockerItemDto)
  blockersList?: BlockerItemDto[];

  // Achievements list with key achievement flag
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AchievementItemDto)
  achievementsList?: AchievementItemDto[];

  // Hours breakdown
  @IsOptional()
  @ValidateNested()
  @Type(() => HoursBreakdownDto)
  hoursBreakdown?: HoursBreakdownDto;

  // Notes or links
  @IsOptional()
  @IsString()
  notesOrLinks?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hoursLogged?: number;

  // Legacy fallback fields
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
