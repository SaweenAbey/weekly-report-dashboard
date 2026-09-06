import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Project } from '../../projects/schemas/project.schema';
import { ReportStatus } from '../../common/enums/report-status.enum';

export type ReportDocument = Report & Document;

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

  @Prop({ type: [String], default: [] })
  tasksCompleted: string[];

  @Prop({ type: [String], default: [] })
  tasksInProgress: string[];

  @Prop({ type: [String], default: [] })
  plansForNextWeek: string[];

  @Prop({ default: '' })
  blockers?: string;

  @Prop({ default: 0, min: 0 })
  hoursLogged: number;

  @Prop({
    type: String,
    enum: ReportStatus,
    default: ReportStatus.DRAFT,
    index: true,
  })
  status: ReportStatus;

  @Prop({ type: [ReviewHistoryItemSchema], default: [] })
  reviewHistory: ReviewHistoryItem[];

  @Prop({ default: '' })
  latestComment?: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
ReportSchema.index({ author: 1, weekStartDate: 1, project: 1 });
