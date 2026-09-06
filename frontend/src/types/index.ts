export type Role = 'ADMIN' | 'MANAGER' | 'TEAM_MEMBER';

export type ReportStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED';

export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  department?: string;
  isActive?: boolean;
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

export interface ReviewHistoryItem {
  _id?: string;
  reviewer: User;
  status: ReportStatus;
  comment: string;
  reviewedAt: string;
}

export interface Report {
  _id: string;
  id?: string;
  author: User;
  project: Project;
  weekStartDate: string;
  weekEndDate: string;
  summary: string;
  tasksCompleted: string[];
  tasksInProgress: string[];
  plansForNextWeek: string[];
  blockers?: string;
  hoursLogged: number;
  status: ReportStatus;
  reviewHistory: ReviewHistoryItem[];
  latestComment?: string;
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
