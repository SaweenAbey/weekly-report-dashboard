export type Role = 'ADMIN' | 'MANAGER' | 'TEAM_MEMBER';

export type ReportStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED';

export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'COMPLETED' | 'IN_PROGRESS' | 'BLOCKED' | 'CANCELLED';

export type ActivityAction =
  | 'USER_REGISTER'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'REPORT_CREATED'
  | 'REPORT_UPDATED'
  | 'REPORT_SUBMITTED'
  | 'REPORT_REVIEWED'
  | 'REPORT_DELETED'
  | 'PROJECT_CREATED'
  | 'ROLE_UPDATED';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  department?: string;
  isActive?: boolean;
  isApproved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  _id: string;
  id?: string;
  name: string;
  key: string;
  description?: string;
  manager: User | string;
  members: (User | string)[];
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskItem {
  _id?: string;
  id?: string;
  taskName: string;
  priority?: TaskPriority;
  plannedPercent?: number;
  actualPercent?: number;
  status?: TaskStatus;
  plannedHours?: number;
  actualHours?: number;
  outputDeliverable?: string;
}

export interface BlockerItem {
  _id?: string;
  id?: string;
  description: string;
  isKeyIssue?: boolean;
}

export interface AchievementItem {
  _id?: string;
  id?: string;
  description: string;
  isKeyAchievement?: boolean;
}

export interface HoursBreakdown {
  development?: number;
  testing?: number;
  meetings?: number;
  documentation?: number;
  other?: number;
}

export interface ReviewHistoryItem {
  _id?: string;
  reviewer: User;
  status: ReportStatus;
  comment: string;
  reviewedAt: string;
}

export interface ReportVersionItem {
  _id?: string;
  versionNumber: number;
  submittedAt: string;
  snapshot: {
    summary?: string;
    tasks?: TaskItem[];
    plansForNextWeek?: string[];
    blockersList?: BlockerItem[];
    achievementsList?: AchievementItem[];
    hoursBreakdown?: HoursBreakdown;
    notesOrLinks?: string;
    hoursLogged?: number;
    tasksCompleted?: string[];
    tasksInProgress?: string[];
    blockers?: string;
  };
  reviewComment?: string;
  reviewStatus?: string;
  reviewerName?: string;
}

export interface Report {
  _id: string;
  id?: string;
  author: User;
  project: Project;
  weekStartDate: string;
  weekEndDate: string;
  summary: string;
  tasks?: TaskItem[];
  plansForNextWeek: string[];
  blockersList?: BlockerItem[];
  achievementsList?: AchievementItem[];
  hoursBreakdown?: HoursBreakdown;
  notesOrLinks?: string;
  hoursLogged: number;
  status: ReportStatus;
  reviewHistory: ReviewHistoryItem[];
  versionHistory?: ReportVersionItem[];
  latestComment?: string;
  createdAt: string;
  updatedAt: string;

  // Legacy compatibility fields
  tasksCompleted?: string[];
  tasksInProgress?: string[];
  blockers?: string;
}

export interface ActivityLog {
  _id: string;
  user?: User;
  action: ActivityAction;
  description: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl?: string;
    department?: string;
  };
  accessToken: string;
  expiresIn: string;
}

export interface ReportQueryParams {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  project?: string;
  author?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardAnalytics {
  summary: {
    totalReports: number;
    submittedThisWeek: number;
    complianceRate: number;
    needsCorrectionCount: number;
    openBlockersCount: number;
    approvedCount: number;
    draftCount: number;
  };
  tasksTrend: {
    week: string;
    completed: number;
    inProgress: number;
  }[];
  memberStatusBreakdown: {
    memberName: string;
    email: string;
    department: string;
    submitted: number;
    approved: number;
    needsCorrection: number;
    draft: number;
    totalHours: number;
  }[];
  projectDistribution: {
    name: string;
    key: string;
    reportsCount: number;
    hoursLogged: number;
  }[];
  timeSpentByTaskType: {
    type: string;
    hours: number;
  }[];
}
