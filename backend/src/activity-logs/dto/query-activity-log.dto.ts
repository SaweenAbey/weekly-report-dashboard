import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ActivityAction } from '../schemas/activity-log.schema';

export class QueryActivityLogDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ActivityAction)
  action?: ActivityAction;

  @IsOptional()
  @IsMongoId()
  user?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
