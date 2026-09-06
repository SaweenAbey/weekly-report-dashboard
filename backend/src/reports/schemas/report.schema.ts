import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Project } from '../../projects/schemas/project.schema';
import { ReportStatus } from '../../common/enums/report-status.enum';

export type ReportDocument = Report & Document;

@Schema({ _id: true, timestamps: false })
export class TaskItem {
  @Prop({ required: true, trim: true })
  taskName: string;

  @Prop({
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
  })
  priority: string;

  @Prop({ type: Number, default: 100, min: 0, max: 100 })
  plannedPercent: number;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  actualPercent: number;

  @Prop({
    type: String,
    enum: ['COMPLETED', 'IN_PROGRESS', 'BLOCKED', 'CANCELLED'],
    default: 'IN_PROGRESS',
  })
  status: string;

  @Prop({ type: Number, default: 0, min: 0 })
  plannedHours: number;

  @Prop({ type: Number, default: 0, min: 0 })
  actualHours: number;

  @Prop({ default: '', trim: true })
  outputDeliverable: string;
}
export const TaskItemSchema = SchemaFactory.createForClass(TaskItem);

@Schema({ _id: true, timestamps: false })
export class BlockerItem {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: Boolean, default: false })
  isKeyIssue: boolean;
}
export const BlockerItemSchema = SchemaFactory.createForClass(BlockerItem);

@Schema({ _id: true, timestamps: false })
export class AchievementItem {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: Boolean, default: false })
  isKeyAchievement: boolean;
}
export const AchievementItemSchema = SchemaFactory.createForClass(AchievementItem);

@Schema({ _id: false, timestamps: false })
export class HoursBreakdown {
  @Prop({ type: Number, default: 0, min: 0 })
  development: number;

  @Prop({ type: Number, default: 0, min: 0 })
  testing: number;

  @Prop({ type: Number, default: 0, min: 0 })
  meetings: number;

  @Prop({ type: Number, default: 0, min: 0 })
  documentation: number;

  @Prop({ type: Number, default: 0, min: 0 })
  other: number;
}
export const HoursBreakdownSchema = SchemaFactory.createForClass(HoursBreakdown);

@Schema({ timestamps: true, _id: true })
export class ReviewHistoryItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  reviewer: Types.ObjectId | User;

  @Prop({ type: String, enum: ReportStatus, required: true })
  status: ReportStatus;

  @Prop({ required: true, trim: true })
  comment: string;

  @Prop({ default: Date.now })
  reviewedAt: Date;
}
export const ReviewHistoryItemSchema =
  SchemaFactory.createForClass(ReviewHistoryItem);

@Schema({ _id: true, timestamps: false })
export class ReportVersionItem {
  @Prop({ required: true, type: Number })
  versionNumber: number;

  @Prop({ default: Date.now })
  submittedAt: Date;

  @Prop({ type: Object, required: true })
  snapshot: Record<string, any>;

  @Prop({ default: '' })
  reviewComment?: string;

  @Prop({ default: '' })
  reviewStatus?: string;

  @Prop({ default: '' })
  reviewerName?: string;
}
export const ReportVersionItemSchema =
  SchemaFactory.createForClass(ReportVersionItem);

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true, index: true })
  author: Types.ObjectId | User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Project.name, required: true, index: true })
  project: Types.ObjectId | Project;

  @Prop({ type: Date, required: true })
  weekStartDate: Date;

  @Prop({ type: Date, required: true })
  weekEndDate: Date;

  @Prop({ required: true, trim: true })
  summary: string;

  // Task-Level Structured Table
  @Prop({ type: [TaskItemSchema], default: [] })
  tasks: TaskItem[];

  // Tasks planned for next week
  @Prop({ type: [String], default: [] })
  plansForNextWeek: string[];

  // Structured Blockers (with key issue flag)
  @Prop({ type: [BlockerItemSchema], default: [] })
  blockersList: BlockerItem[];

  // Structured Achievements (with key achievement flag)
  @Prop({ type: [AchievementItemSchema], default: [] })
  achievementsList: AchievementItem[];

  // Hours Breakdown by Task Type
  @Prop({ type: HoursBreakdownSchema, default: () => ({}) })
  hoursBreakdown: HoursBreakdown;

  // Optional Notes or Links
  @Prop({ default: '', trim: true })
  notesOrLinks?: string;

  @Prop({ default: 0, min: 0 })
  hoursLogged: number;

  @Prop({
    type: String,
    enum: ReportStatus,
    default: ReportStatus.DRAFT,
    index: true,
  })
  status: ReportStatus;

  // Review comments & history
  @Prop({ type: [ReviewHistoryItemSchema], default: [] })
  reviewHistory: ReviewHistoryItem[];

  @Prop({ default: '' })
  latestComment?: string;

  // Version history of revisions
  @Prop({ type: [ReportVersionItemSchema], default: [] })
  versionHistory: ReportVersionItem[];

  // Backward compatibility legacy fields
  @Prop({ type: [String], default: [] })
  tasksCompleted: string[];

  @Prop({ type: [String], default: [] })
  tasksInProgress: string[];

  @Prop({ default: '' })
  blockers?: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
ReportSchema.index({ author: 1, weekStartDate: 1, project: 1 });
