import { apiClient } from './client';
import {
  DashboardAnalytics,
  PaginatedResult,
  Report,
  ReportQueryParams,
  ReportStatus,
  Project,
  User,
} from '../types';

export type ReportPayload = Partial<Omit<Report, 'project' | 'author'>> & {
  project?: string | Project;
  author?: string | User;
};

export const reportsApi = {
  getAll: async (params?: ReportQueryParams): Promise<PaginatedResult<Report>> => {
    const res: any = await apiClient.get('/reports', { params });
    return res.data || res;
  },

  getById: async (id: string): Promise<Report> => {
    const res: any = await apiClient.get(`/reports/${id}`);
    return res.data || res;
  },

  getAnalytics: async (): Promise<DashboardAnalytics> => {
    const res: any = await apiClient.get('/reports/analytics/dashboard');
    return res.data || res;
  },

  create: async (data: ReportPayload): Promise<Report> => {
    const res: any = await apiClient.post('/reports', data);
    return res.data || res;
  },

  update: async (
    id: string,
    data: ReportPayload,
  ): Promise<Report> => {
    const res: any = await apiClient.patch(`/reports/${id}`, data);
    return res.data || res;
  },

  submit: async (id: string): Promise<Report> => {
    const res: any = await apiClient.post(`/reports/${id}/submit`);
    return res.data || res;
  },

  review: async (
    id: string,
    data: { status: ReportStatus; comment: string },
  ): Promise<Report> => {
    const res: any = await apiClient.post(`/reports/${id}/review`, data);
    return res.data || res;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reports/${id}`);
  },
};
