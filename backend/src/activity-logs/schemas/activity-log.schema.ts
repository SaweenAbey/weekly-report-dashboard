import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ActivityLogDocument = ActivityLog & Document;

export enum ActivityAction {
  USER_REGISTER = 'USER_REGISTER',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  REPORT_CREATED = 'REPORT_CREATED',
  REPORT_UPDATED = 'REPORT_UPDATED',
  REPORT_SUBMITTED = 'REPORT_SUBMITTED',
  REPORT_REVIEWED = 'REPORT_REVIEWED',
  REPORT_DELETED = 'REPORT_DELETED',
  PROJECT_CREATED = 'PROJECT_CREATED',
  ROLE_UPDATED = 'ROLE_UPDATED',
}

@Schema({ timestamps: true })
export class ActivityLog {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, index: true })
  user?: Types.ObjectId | User;

  @Prop({ type: String, enum: ActivityAction, required: true, index: true })
  action: ActivityAction;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ default: '' })
  ip?: string;

  @Prop({ default: '' })
  userAgent?: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ user: 1, createdAt: -1 });
