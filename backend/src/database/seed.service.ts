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
    this.logger.log('🌱 Starting comprehensive database seed...');

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
      department: 'Frontend Engineering',
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

    const devLisa = await this.userModel.create({
      name: 'Lisa Chen',
      email: 'lisa.dev@example.com',
      password: defaultPassword,
      role: Role.TEAM_MEMBER,
      department: 'QA & Automation',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      isActive: true,
      isApproved: true,
    });

    this.logger.log('👥 Users seeded successfully');

    // 2. Create Projects
    const projectWRD = await this.projectModel.create({
      name: 'Weekly Report Dashboard 2.0',
      key: 'WRD',
      description: 'Modern enterprise dashboard for weekly engineering report submissions, compliance tracking, and review workflows.',
      manager: managerSarah._id,
      members: [devJohn._id, devEmma._id, devLisa._id],
      status: ProjectStatus.ACTIVE,
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-12-31'),
    });

    const projectCIM = await this.projectModel.create({
      name: 'Cloud Infrastructure Modernization',
      key: 'CIM',
      description: 'Migrating legacy monolith servers to containerized microservices and automated CI/CD pipeline orchestration.',
      manager: managerAlex._id,
      members: [devDavid._id, devJohn._id],
      status: ProjectStatus.ACTIVE,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-08-30'),
    });

    const projectAIX = await this.projectModel.create({
      name: 'AI Insights & Automation Hub',
      key: 'AIX',
      description: 'Automated executive summary generation and delivery risk predictions for engineering initiatives.',
      manager: managerSarah._id,
      members: [devEmma._id, devLisa._id],
      status: ProjectStatus.ACTIVE,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-11-30'),
    });

    this.logger.log('📁 Projects seeded successfully');

    // 3. Create Multi-Week Reports with Standardized Format

    // --- Week 34 (Approved) - John Developer ---
    await this.reportModel.create({
      author: devJohn._id,
      project: projectWRD._id,
      weekStartDate: new Date('2026-08-18'),
      weekEndDate: new Date('2026-08-24'),
      summary: 'Completed backend security architecture, JWT authentication with refresh token strategy, and role authorization guards.',
      tasks: [
        {
          taskName: 'Implement Passport JWT Strategy & Guard',
          priority: 'HIGH',
          plannedPercent: 100,
          actualPercent: 100,
          status: 'COMPLETED',
          plannedHours: 12,
          actualHours: 12,
          outputDeliverable: 'PR #12 - JWT authentication module',
        },
        {
          taskName: 'Role-Based Access Control Guards',
          priority: 'HIGH',
          plannedPercent: 100,
          actualPercent: 100,
          status: 'COMPLETED',
          plannedHours: 10,
          actualHours: 10,
          outputDeliverable: 'RolesGuard with execution context reflector',
        },
        {
          taskName: 'Mongoose Entity Schemas Setup',
          priority: 'MEDIUM',
          plannedPercent: 100,
          actualPercent: 100,
          status: 'COMPLETED',
          plannedHours: 8,
          actualHours: 9,
          outputDeliverable: 'User, Project, and Report schemas',
        },
      ],
      plansForNextWeek: [
        'Build report review workflow endpoints',
        'Add activity log audit interceptors',
      ],
      blockersList: [
        {
          description: 'MongoDB Atlas network whitelist latency during peak test runs',
          isKeyIssue: false,
        },
      ],
      achievementsList: [
        {
          description: 'Achieved 100% test coverage on authentication security guards',
          isKeyAchievement: true,
        },
      ],
      hoursBreakdown: {
        development: 26,
        testing: 8,
        meetings: 4,
        documentation: 3,
        other: 0,
      },
      hoursLogged: 41,
      notesOrLinks: 'https://github.com/org/repo/pull/12',
      status: ReportStatus.APPROVED,
      latestComment: 'Excellent architecture and clean guards! Approved without changes.',
      reviewHistory: [
        {
          reviewer: managerSarah._id,
          status: ReportStatus.APPROVED,
          comment: 'Excellent architecture and clean guards! Approved without changes.',
          reviewedAt: new Date('2026-08-25T14:30:00Z'),
        },
      ],
      versionHistory: [],
    });

    // --- Week 35 (Approved) - Emma Watson ---
    await this.reportModel.create({
      author: devEmma._id,
      project: projectWRD._id,
      weekStartDate: new Date('2026-08-25'),
      weekEndDate: new Date('2026-08-31'),
      summary: 'Designed and built high-performance responsive frontend layout with Tailwind CSS and glassmorphism styling.',
      tasks: [
        {
          taskName: 'Executive Dashboard KPI Layout',
          priority: 'HIGH',
          plannedPercent: 100,
          actualPercent: 100,
          status: 'COMPLETED',
          plannedHours: 14,
          actualHours: 14,
          outputDeliverable: 'Interactive KPI summary cards and responsive grid',
        },
        {
          taskName: 'Visual Velocity & Donut Charts',
          priority: 'MEDIUM',
          plannedPercent: 100,
          actualPercent: 100,
          status: 'COMPLETED',
          plannedHours: 12,
          actualHours: 14,
          outputDeliverable: 'Custom zero-dependency SVG charts',
        },
      ],
      plansForNextWeek: [
        'Implement standardized report creator form with validation',
        'Add user profile and member history pages',
      ],
      blockersList: [],
      achievementsList: [
        {
          description: 'Zero external chart dependency payload with blazing fast SVG render performance',
          isKeyAchievement: true,
        },
      ],
      hoursBreakdown: {
        development: 28,
        testing: 6,
        meetings: 3,
        documentation: 2,
        other: 0,
      },
      hoursLogged: 39,
      status: ReportStatus.APPROVED,
      latestComment: 'Stunning visual aesthetics and very responsive layout. Approved!',
      reviewHistory: [
        {
          reviewer: managerSarah._id,
          status: ReportStatus.APPROVED,
          comment: 'Stunning visual aesthetics and very responsive layout. Approved!',
          reviewedAt: new Date('2026-09-01T10:00:00Z'),
        },
      ],
      versionHistory: [],
    });

    // --- Week 35 (Changes Requested with Version History) - David Kim ---
    await this.reportModel.create({
      author: devDavid._id,
      project: projectCIM._id,
      weekStartDate: new Date('2026-08-25'),
      weekEndDate: new Date('2026-08-31'),
      summary: 'Prepared staging Kubernetes cluster manifests and containerized Docker images.',
      tasks: [
        {
          taskName: 'Kubernetes Ingress & TLS Secret Setup',
          priority: 'HIGH',
          plannedPercent: 100,
          actualPercent: 75,
          status: 'IN_PROGRESS',
          plannedHours: 15,
          actualHours: 18,
          outputDeliverable: 'Ingress routing yaml config',
        },
        {
          taskName: 'Dockerfile Multi-Stage Optimization',
          priority: 'MEDIUM',
          plannedPercent: 100,
          actualPercent: 100,
          status: 'COMPLETED',
          plannedHours: 8,
          actualHours: 8,
          outputDeliverable: 'Reduced image size by 65%',
        },
      ],
      plansForNextWeek: [
        'Complete DNS propagation and SSL automation',
        'Run load tests with k6 on staging cluster',
      ],
      blockersList: [
        {
          description: 'Awaiting AWS cloud quota increase approval from DevOps Lead',
          isKeyIssue: true,
        },
      ],
      achievementsList: [
        {
          description: 'Reduced Docker build duration by 4 minutes with multi-stage caching',
          isKeyAchievement: true,
        },
      ],
      hoursBreakdown: {
        development: 22,
        testing: 8,
        meetings: 5,
        documentation: 3,
        other: 2,
      },
      hoursLogged: 40,
      status: ReportStatus.CHANGES_REQUESTED,
      latestComment: 'Please break down the ingress blocker and specify the ETA for the TLS certificate resolution.',
      reviewHistory: [
        {
          reviewer: managerAlex._id,
          status: ReportStatus.CHANGES_REQUESTED,
          comment: 'Please break down the ingress blocker and specify the ETA for the TLS certificate resolution.',
          reviewedAt: new Date('2026-09-02T11:15:00Z'),
        },
      ],
      versionHistory: [
        {
          versionNumber: 1,
          submittedAt: new Date('2026-08-31T18:00:00Z'),
          snapshot: {
            summary: 'Initial draft of staging Kubernetes cluster deployment.',
            hoursLogged: 36,
          },
          reviewComment: 'Please break down the ingress blocker and specify the ETA for the TLS certificate resolution.',
          reviewStatus: 'CHANGES_REQUESTED',
          reviewerName: 'Alex Rivera (Manager)',
        },
      ],
    });

    // --- Week 36 (Submitted / Under Review) - Lisa Chen ---
    await this.reportModel.create({
      author: devLisa._id,
      project: projectWRD._id,
      weekStartDate: new Date('2026-09-01'),
      weekEndDate: new Date('2026-09-07'),
      summary: 'Executed comprehensive end-to-end testing across report submission, review cycle, and audit trail logs.',
      tasks: [
        {
          taskName: 'Cypress E2E Test Suite for Report Approval Flow',
          priority: 'HIGH',
          plannedPercent: 100,
          actualPercent: 100,
          status: 'COMPLETED',
          plannedHours: 16,
          actualHours: 15,
          outputDeliverable: '14 automated test suites passing in CI',
        },
        {
          taskName: 'Role Guard Permission Verification Matrix',
          priority: 'HIGH',
          plannedPercent: 100,
          actualPercent: 100,
          status: 'COMPLETED',
          plannedHours: 10,
          actualHours: 11,
          outputDeliverable: 'Automated RBAC test coverage suite',
        },
      ],
      plansForNextWeek: [
        'Set up automated accessibility compliance checking (a11y)',
        'Create performance test benchmarks for dashboard chart rendering',
      ],
      blockersList: [
        {
          description: 'Intermittent rate-limiting in test sandbox environment',
          isKeyIssue: false,
        },
      ],
      achievementsList: [
        {
          description: 'Zero regressions detected across all 8+ core pages in sprint release',
          isKeyAchievement: true,
        },
      ],
      hoursBreakdown: {
        development: 12,
        testing: 20,
        meetings: 4,
        documentation: 4,
        other: 0,
      },
      hoursLogged: 40,
      status: ReportStatus.SUBMITTED,
      latestComment: '',
      reviewHistory: [],
      versionHistory: [],
    });

    // --- Week 36 (Draft) - John Developer ---
    await this.reportModel.create({
      author: devJohn._id,
      project: projectAIX._id,
      weekStartDate: new Date('2026-09-01'),
      weekEndDate: new Date('2026-09-07'),
      summary: 'Drafting AI summary generation prompt pipelines and executive aggregation models.',
      tasks: [
        {
          taskName: 'LangChain Summarization Workflow Spike',
          priority: 'HIGH',
          plannedPercent: 100,
          actualPercent: 50,
          status: 'IN_PROGRESS',
          plannedHours: 12,
          actualHours: 6,
          outputDeliverable: 'Prototype endpoint for weekly executive digests',
        },
      ],
      plansForNextWeek: [
        'Connect AI summary trigger to weekly manager review email alerts',
      ],
      blockersList: [],
      achievementsList: [],
      hoursBreakdown: {
        development: 14,
        testing: 4,
        meetings: 3,
        documentation: 2,
        other: 0,
      },
      hoursLogged: 23,
      status: ReportStatus.DRAFT,
      latestComment: '',
      reviewHistory: [],
      versionHistory: [],
    });

    this.logger.log('📊 Multi-week reports with standardized tables and snapshots seeded');
    this.logger.log('✅ Database seeding complete!');
    this.logger.log('---------------------------------------------------------');
    this.logger.log('Default Seed Accounts:');
    this.logger.log('🔑 Admin: admin@example.com / Password123!');
    this.logger.log('🔑 Manager 1: sarah.manager@example.com / Password123!');
    this.logger.log('🔑 Manager 2: alex.manager@example.com / Password123!');
    this.logger.log('🔑 Team Member 1: john.dev@example.com / Password123!');
    this.logger.log('🔑 Team Member 2: emma.dev@example.com / Password123!');
    this.logger.log('🔑 Team Member 3: david.dev@example.com / Password123!');
    this.logger.log('🔑 Team Member 4: lisa.dev@example.com / Password123!');
    this.logger.log('---------------------------------------------------------');
  }
}
