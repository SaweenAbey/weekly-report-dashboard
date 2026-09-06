import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ActivityAction,
  ActivityLog,
  ActivityLogDocument,
} from './schemas/activity-log.schema';
import { QueryActivityLogDto } from './dto/query-activity-log.dto';
import { PaginatedResult } from '../common/dto/pagination.dto';

export interface CreateLogParams {
  user?: string | Types.ObjectId;
  action: ActivityAction;
  description: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger(ActivityLogsService.name);

  constructor(
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async log(params: CreateLogParams): Promise<ActivityLogDocument> {
    try {
      const created = new this.activityLogModel({
        user: params.user ? new Types.ObjectId(params.user) : undefined,
        action: params.action,
        description: params.description,
        ip: params.ip || '',
        userAgent: params.userAgent || '',
        metadata: params.metadata || {},
      });

      this.logger.log(`[ACTIVITY] ${params.action}: ${params.description}`);
      return await created.save();
    } catch (err) {
      this.logger.error('Failed to write activity log', err);
      throw err;
    }
  }

  async findAll(
    queryDto: QueryActivityLogDto,
  ): Promise<PaginatedResult<ActivityLogDocument>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      action,
      user,
    } = queryDto;

    const filter: Record<string, any> = {};

    if (action) {
      filter.action = action;
    }

    if (user) {
      filter.user = new Types.ObjectId(user);
    }

    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    const total = await this.activityLogModel.countDocuments(filter);
    const sort: Record<string, any> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const data = await this.activityLogModel
      .find(filter)
      .populate('user', 'name email role department avatarUrl')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findByUser(
    userId: string,
    limit = 10,
  ): Promise<ActivityLogDocument[]> {
    return this.activityLogModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email role')
      .exec();
  }
}
