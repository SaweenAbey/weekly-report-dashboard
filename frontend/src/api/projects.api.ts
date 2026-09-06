import { apiClient } from './client';
import { PaginatedResult, Project } from '../types';

export const projectsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResult<Project>> => {
    const res: any = await apiClient.get('/projects', { params });
    return res.data || res;
  },

  getById: async (id: string): Promise<Project> => {
    const res: any = await apiClient.get(`/projects/${id}`);
    return res.data || res;
  },

  create: async (data: {
    name: string;
    key: string;
    description?: string;
    manager: string;
    members?: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<Project> => {
    const res: any = await apiClient.post('/projects', data);
    return res.data || res;
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const res: any = await apiClient.patch(`/projects/${id}`, data);
    return res.data || res;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};
