import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ProjectDocument = Project & Document;

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, uppercase: true, trim: true })
  key: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  manager: Types.ObjectId | User;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: User.name }])
  members: (Types.ObjectId | User)[];

  @Prop({ type: String, enum: ProjectStatus, default: ProjectStatus.ACTIVE })
  status: ProjectStatus;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
