import { apiClient } from './client';
import { PaginatedResult, User } from '../types';

export const usersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResult<User>> => {
    const res: any = await apiClient.get('/users', { params });
    return res.data || res;
  },

  getById: async (id: string): Promise<User> => {
    const res: any = await apiClient.get(`/users/${id}`);
    return res.data || res;
  },

  create: async (data: Partial<User> & { password: string }): Promise<User> => {
    const res: any = await apiClient.post('/users', data);
    return res.data || res;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const res: any = await apiClient.patch(`/users/${id}`, data);
    return res.data || res;
  },

  approve: async (id: string): Promise<User> => {
    const res: any = await apiClient.patch(`/users/${id}/approve`);
    return res.data || res;
  },

  toggleActive: async (id: string): Promise<User> => {
    const res: any = await apiClient.patch(`/users/${id}/toggle-active`);
    return res.data || res;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
