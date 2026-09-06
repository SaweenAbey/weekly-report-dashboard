import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument } from './schemas/report.schema';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReviewReportDto } from './dto/review-report.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { PaginatedResult } from '../common/dto/pagination.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { Role } from '../common/enums/role.enum';
import { ReportStatus } from '../common/enums/report-status.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../activity-logs/schemas/activity-log.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name)
    private readonly reportModel: Model<ReportDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(
    createReportDto: CreateReportDto,
    currentUser: UserDocument,
  ): Promise<ReportDocument> {
    // Verify project exists
    const project = await this.projectModel.findById(createReportDto.project);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const createdReport = new this.reportModel({
      ...createReportDto,
      author: currentUser._id,
      status: ReportStatus.DRAFT,
      reviewHistory: [],
      latestComment: '',
    });

    const savedReport = await createdReport.save();
    await this.activityLogsService.log({
      user: currentUser._id.toString(),
      action: ActivityAction.REPORT_CREATED,
      description: `Draft report created for project ${project.name} (Week of ${new Date(createReportDto.weekStartDate).toLocaleDateString()})`,
      metadata: { reportId: savedReport._id, projectId: project._id },
    });

    return savedReport.populate([
      { path: 'author', select: 'name email avatarUrl department' },
      { path: 'project', select: 'name key manager' },
    ]);
  }

  async findAll(
    queryDto: QueryReportDto,
    currentUser: UserDocument,
  ): Promise<PaginatedResult<ReportDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      project,
      author,
      startDate,
      endDate,
    } = queryDto;

    const filter: Record<string, any> = {};

    // Strict Role-Based Access Control
    if (currentUser.role === Role.TEAM_MEMBER) {
      // Team members can NEVER see another team member's reports
      filter.author = currentUser._id;
    } else if (currentUser.role === Role.MANAGER) {
      // Managers can view reports from projects they manage or created by themselves
      const managedProjects = await this.projectModel
        .find({
          $or: [{ manager: currentUser._id }, { members: currentUser._id }],
        })
        .select('_id')
        .exec();

      const projectIds = managedProjects.map((p) => p._id);

      if (project) {
        // Ensure manager has access to the requested project
        if (!projectIds.some((pId) => pId.toString() === project)) {
          throw new ForbiddenException(
            'You do not have access to view reports for this project',
          );
        }
        filter.project = new Types.ObjectId(project);
      } else {
        filter.$or = [
          { project: { $in: projectIds } },
          { author: currentUser._id },
        ];
      }

      if (author) {
        filter.author = new Types.ObjectId(author);
      }
    } else if (currentUser.role === Role.ADMIN) {
      // Admin can filter by anything
      if (project) filter.project = new Types.ObjectId(project);
      if (author) filter.author = new Types.ObjectId(author);
    }

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.weekStartDate = {};
      if (startDate) {
        filter.weekStartDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.weekStartDate.$lte = new Date(endDate);
      }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchConditions = [
        { summary: searchRegex },
        { blockers: searchRegex },
        { tasksCompleted: searchRegex },
        { tasksInProgress: searchRegex },
        { plansForNextWeek: searchRegex },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const total = await this.reportModel.countDocuments(filter);
    const sort: Record<string, any> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const data = await this.reportModel
      .find(filter)
      .populate('author', 'name email avatarUrl department role')
      .populate('project', 'name key manager')
      .populate('reviewHistory.reviewer', 'name email avatarUrl role')
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

  async findById(id: string, currentUser: UserDocument): Promise<ReportDocument> {
    const report = await this.reportModel
      .findById(id)
      .populate('author', 'name email avatarUrl department role')
      .populate('project', 'name key manager members')
      .populate('reviewHistory.reviewer', 'name email avatarUrl role')
      .exec();

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    // Role-based authorization check
    this.assertCanViewReport(report, currentUser);

    return report;
  }

  async update(
    id: string,
    updateReportDto: UpdateReportDto,
    currentUser: UserDocument,
  ): Promise<ReportDocument> {
    const report = await this.reportModel.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    // Only author or admin can update
    const isAuthor = report.author.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === Role.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('You can only update your own reports');
    }

    // If author is updating, cannot update already approved/submitted reports unless changes were requested or draft
    if (
      !isAdmin &&
      report.status !== ReportStatus.DRAFT &&
      report.status !== ReportStatus.CHANGES_REQUESTED
    ) {
      throw new BadRequestException(
        `Cannot edit report in status '${report.status}'. Only DRAFT or CHANGES_REQUESTED reports can be edited.`,
      );
    }

    const updated = await this.reportModel
      .findByIdAndUpdate(id, { $set: updateReportDto }, { new: true })
      .populate('author', 'name email avatarUrl department')
      .populate('project', 'name key manager')
      .populate('reviewHistory.reviewer', 'name email avatarUrl role')
      .exec();

    return updated!;
  }

  async submitReport(id: string, currentUser: UserDocument): Promise<ReportDocument> {
    const report = await this.reportModel.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    if (
      report.author.toString() !== currentUser._id.toString() &&
      currentUser.role !== Role.ADMIN
    ) {
      throw new ForbiddenException('You can only submit your own reports');
    }

    if (
      report.status !== ReportStatus.DRAFT &&
      report.status !== ReportStatus.CHANGES_REQUESTED
    ) {
      throw new BadRequestException(
        `Report cannot be submitted from status '${report.status}'.`,
      );
    }

    report.status = ReportStatus.SUBMITTED;
    const saved = await report.save();

    await this.activityLogsService.log({
      user: currentUser._id.toString(),
      action: ActivityAction.REPORT_SUBMITTED,
      description: `Weekly report submitted for manager review by ${currentUser.name}`,
      metadata: { reportId: report._id },
    });

    return saved;
  }

  async reviewReport(
    id: string,
    reviewReportDto: ReviewReportDto,
    currentUser: UserDocument,
  ): Promise<ReportDocument> {
    const report = await this.reportModel
      .findById(id)
      .populate('project', 'manager');

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    // Role check: Only MANAGER (of the project or assigned) or ADMIN can review
    const project = report.project as any;
    const isProjectManager =
      project &&
      project.manager &&
      project.manager.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === Role.ADMIN;
    const isManagerRole = currentUser.role === Role.MANAGER;

    if (!isProjectManager && !isAdmin && !isManagerRole) {
      throw new ForbiddenException(
        'Only managers or administrators can review reports',
      );
    }

    // Add entry to review history
    const historyEntry = {
      reviewer: currentUser._id,
      status: reviewReportDto.status,
      comment: reviewReportDto.comment,
      reviewedAt: new Date(),
    };

    report.status = reviewReportDto.status;
    report.latestComment = reviewReportDto.comment;
    report.reviewHistory.push(historyEntry as any);

    await report.save();

    await this.activityLogsService.log({
      user: currentUser._id.toString(),
      action: ActivityAction.REPORT_REVIEWED,
      description: `Report reviewed by ${currentUser.name}: ${reviewReportDto.status} ("${reviewReportDto.comment.substring(0, 50)}...")`,
      metadata: { reportId: report._id, decision: reviewReportDto.status },
    });

    return this.findById(id, currentUser);
  }

  async remove(id: string, currentUser: UserDocument): Promise<void> {
    const report = await this.reportModel.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    const isAuthor = report.author.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === Role.ADMIN;

    if (!isAdmin && (!isAuthor || report.status !== ReportStatus.DRAFT)) {
      throw new ForbiddenException(
        'You can only delete your own draft reports',
      );
    }

    await this.reportModel.findByIdAndDelete(id).exec();
  }

  private assertCanViewReport(report: ReportDocument, currentUser: UserDocument) {
    if (currentUser.role === Role.ADMIN) return;

    const authorId =
      typeof report.author === 'object' && '_id' in report.author
        ? (report.author as any)._id.toString()
        : report.author.toString();

    if (authorId === currentUser._id.toString()) return;

    if (currentUser.role === Role.MANAGER) {
      const project = report.project as any;
      if (project) {
        const managerId = project.manager?._id
          ? project.manager._id.toString()
          : project.manager?.toString();
        if (managerId === currentUser._id.toString()) return;

        if (Array.isArray(project.members)) {
          const isMember = project.members.some((m: any) => {
            const memberId = m._id ? m._id.toString() : m.toString();
            return memberId === currentUser._id.toString();
          });
          if (isMember) return;
        }
      }
    }

    throw new ForbiddenException(
      'Access denied: you do not have permission to view this report',
    );
  }
}
