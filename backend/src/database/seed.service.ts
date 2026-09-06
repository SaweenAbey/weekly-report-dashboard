import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Project, ProjectDocument, ProjectStatus } from '../projects/schemas/project.schema';
import { Report, ReportDocument } from '../reports/schemas/report.schema';
import { Role } from '../common/enums/role.enum';
import { ReportStatus } from '../common/enums/report-status.enum';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
  ) {}

  async seed() {
    this.logger.log('🌱 Starting database seed...');

    // Clear existing data
    await this.reportModel.deleteMany({});
    await this.projectModel.deleteMany({});
    await this.userModel.deleteMany({});

    this.logger.log('🧹 Existing collections cleared');

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('Password123!', salt);

    // 1. Create Users
    const admin = await this.userModel.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: defaultPassword,
      role: Role.ADMIN,
      department: 'Executive Operations',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
      isActive: true,
      isApproved: true,
    });

    const managerSarah = await this.userModel.create({
      name: 'Sarah Connor (Manager)',
      email: 'sarah.manager@example.com',
      password: defaultPassword,
      role: Role.MANAGER,
      department: 'Core Product Engineering',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      isActive: true,
      isApproved: true,
    });

    const managerAlex = await this.userModel.create({
      name: 'Alex Rivera (Manager)',
      email: 'alex.manager@example.com',
      password: defaultPassword,
      role: Role.MANAGER,
      department: 'Platform & Infrastructure',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      isActive: true,
      isApproved: true,
    });

    const devJohn = await this.userModel.create({
      name: 'John Developer',
      email: 'john.dev@example.com',
      password: defaultPassword,
      role: Role.TEAM_MEMBER,
      department: 'Core Product Engineering',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      isActive: true,
      isApproved: true,
    });

    const devEmma = await this.userModel.create({
      name: 'Emma Watson',
      email: 'emma.dev@example.com',
      password: defaultPassword,
      role: Role.TEAM_MEMBER,
      department: 'Core Product Engineering',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
      isActive: true,
      isApproved: true,
    });

    const devDavid = await this.userModel.create({
      name: 'David Kim',
      email: 'david.dev@example.com',
      password: defaultPassword,
      role: Role.TEAM_MEMBER,
      department: 'Platform & Infrastructure',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      isActive: true,
      isApproved: true,
    });

    this.logger.log('👥 Users seeded successfully');

    // 2. Create Projects
    const projectWeeklyDashboard = await this.projectModel.create({
      name: 'Weekly Report Dashboard 2.0',
      key: 'WRD',
      description: 'Modern enterprise dashboard for weekly engineering report submissions and reviews.',
      manager: managerSarah._id,
      members: [devJohn._id, devEmma._id],
      status: ProjectStatus.ACTIVE,
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-12-31'),
    });

    const projectCloudMigration = await this.projectModel.create({
      name: 'Cloud Infrastructure Modernization',
      key: 'CIM',
      description: 'Migrating legacy monolith servers to containerized microservices and automated CI/CD.',
      manager: managerAlex._id,
      members: [devDavid._id],
      status: ProjectStatus.ACTIVE,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-08-30'),
    });

    this.logger.log('📁 Projects seeded successfully');

    // 3. Create Sample Reports with Review History
    // Report 1: Approved report for John
    await this.reportModel.create({
      author: devJohn._id,
      project: projectWeeklyDashboard._id,
      weekStartDate: new Date('2026-08-25'),
      weekEndDate: new Date('2026-08-31'),
      summary: 'Completed JWT authentication integration, role guards, and MongoDB schema design.',
      tasksCompleted: [
        'Configured NestJS passport-jwt strategy and RolesGuard',
        'Implemented Mongoose schemas for User, Project, and Report',
        'Added pagination and filtering DTOs with class-validator',
      ],
      tasksInProgress: ['Building REST endpoints for report approval workflow'],
      plansForNextWeek: [
        'Complete Swagger API documentation',
        'Connect frontend dashboard UI to backend API',
      ],
      blockers: 'None',
      hoursLogged: 40,
      status: ReportStatus.APPROVED,
      latestComment: 'Excellent work on the architecture and clean security guards! Approved.',
      reviewHistory: [
        {
          reviewer: managerSarah._id,
          status: ReportStatus.UNDER_REVIEW,
          comment: 'Started reviewing report submissions for Week 35.',
          reviewedAt: new Date('2026-09-01T09:30:00Z'),
        },
        {
          reviewer: managerSarah._id,
          status: ReportStatus.APPROVED,
          comment: 'Excellent work on the architecture and clean security guards! Approved.',
          reviewedAt: new Date('2026-09-01T14:15:00Z'),
        },
      ],
    });

    // Report 2: Changes Requested for Emma
    await this.reportModel.create({
      author: devEmma._id,
      project: projectWeeklyDashboard._id,
      weekStartDate: new Date('2026-08-25'),
      weekEndDate: new Date('2026-08-31'),
      summary: 'Worked on dashboard analytics UI mockups and chart components.',
      tasksCompleted: [
        'Designed high-fidelity mockups for status timeline',
        'Created responsive sidebar and navbar components',
      ],
      tasksInProgress: ['Integrating Chart.js for review turnaround metrics'],
      plansForNextWeek: [
        'Refine color palette with glassmorphism design tokens',
        'Add export to PDF functionality',
      ],
      blockers: 'Waiting for approved color palette guidelines from design team.',
      hoursLogged: 36.5,
      status: ReportStatus.CHANGES_REQUESTED,
      latestComment: 'Please specify the exact hours logged per task item before resubmitting.',
      reviewHistory: [
        {
          reviewer: managerSarah._id,
          status: ReportStatus.CHANGES_REQUESTED,
          comment: 'Please specify the exact hours logged per task item before resubmitting.',
          reviewedAt: new Date('2026-09-02T11:00:00Z'),
        },
      ],
    });

    // Report 3: Submitted report for David (Cloud Migration)
    await this.reportModel.create({
      author: devDavid._id,
      project: projectCloudMigration._id,
      weekStartDate: new Date('2026-09-01'),
      weekEndDate: new Date('2026-09-07'),
      summary: 'Configured Docker Compose setup and prepared Kubernetes manifests for staging cluster.',
      tasksCompleted: [
        'Drafted Dockerfile multi-stage builds for NestJS and MongoDB',
        'Set up GitHub Actions workflow for automated unit tests and linting',
      ],
      tasksInProgress: ['Configuring ingress controller with SSL certificates'],
      plansForNextWeek: ['Deploy staging environment and run performance stress tests'],
      blockers: 'Awaiting cloud quota increase approval from AWS operations.',
      hoursLogged: 39,
      status: ReportStatus.SUBMITTED,
      latestComment: '',
      reviewHistory: [],
    });

    // Report 4: Draft report for John (Current Week)
    await this.reportModel.create({
      author: devJohn._id,
      project: projectWeeklyDashboard._id,
      weekStartDate: new Date('2026-09-01'),
      weekEndDate: new Date('2026-09-07'),
      summary: 'Finalizing backend REST controllers and preparing documentation.',
      tasksCompleted: [
        'Added global exception filter and response interceptor',
        'Implemented seed runner script',
      ],
      tasksInProgress: ['Writing API integration tests'],
      plansForNextWeek: ['Support frontend team during dashboard integration'],
      blockers: 'None',
      hoursLogged: 24,
      status: ReportStatus.DRAFT,
      latestComment: '',
      reviewHistory: [],
    });

    this.logger.log('📊 Sample Reports seeded successfully');
    this.logger.log('✅ Database seeding finished!');
    this.logger.log('---------------------------------------------------------');
    this.logger.log('Default Seed Users:');
    this.logger.log('🔑 Admin: admin@example.com / Password123!');
    this.logger.log('🔑 Manager 1: sarah.manager@example.com / Password123!');
    this.logger.log('🔑 Manager 2: alex.manager@example.com / Password123!');
    this.logger.log('🔑 Member 1: john.dev@example.com / Password123!');
    this.logger.log('🔑 Member 2: emma.dev@example.com / Password123!');
    this.logger.log('🔑 Member 3: david.dev@example.com / Password123!');
    this.logger.log('---------------------------------------------------------');
  }
}
