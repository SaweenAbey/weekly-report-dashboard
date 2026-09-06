import { apiClient } from './client';
import { PaginatedResult, Report, ReportQueryParams, ReportStatus } from '../types';

export const reportsApi = {
  getAll: async (params?: ReportQueryParams): Promise<PaginatedResult<Report>> => {
    const res: any = await apiClient.get('/reports', { params });
    return res.data || res;
  },

  getById: async (id: string): Promise<Report> => {
    const res: any = await apiClient.get(`/reports/${id}`);
    return res.data || res;
  },

  create: async (data: {
    project: string;
    weekStartDate: string;
    weekEndDate: string;
    summary: string;
    tasksCompleted?: string[];
    tasksInProgress?: string[];
    plansForNextWeek?: string[];
    blockers?: string;
    hoursLogged?: number;
  }): Promise<Report> => {
    const res: any = await apiClient.post('/reports', data);
    return res.data || res;
  },

  update: async (
    id: string,
    data: Partial<{
      project: string;
      weekStartDate: string;
      weekEndDate: string;
      summary: string;
      tasksCompleted: string[];
      tasksInProgress: string[];
      plansForNextWeek: string[];
      blockers: string;
      hoursLogged: number;
    }>,
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
