import { apiClient } from './client';
import { ActivityLog, PaginatedResult } from '../types';

export const logsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    action?: string;
    search?: string;
  }): Promise<PaginatedResult<ActivityLog>> => {
    const res: any = await apiClient.get('/logs', { params });
    return res.data || res;
  },
};
