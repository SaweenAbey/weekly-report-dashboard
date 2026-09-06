import { apiClient } from './client';
import { AuthResponse, User, ActivityLog } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res: any = await apiClient.post('/auth/login', { email, password });
    return res.data || res;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
  }): Promise<{ message: string; isApproved: boolean; user: any }> => {
    const res: any = await apiClient.post('/auth/register', data);
    return res.data || res;
  },

  getProfile: async (): Promise<User> => {
    const res: any = await apiClient.get('/auth/profile');
    return res.data || res;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const res: any = await apiClient.post('/auth/change-password', data);
    return res.data || res;
  },

  logout: async (): Promise<{ message: string }> => {
    const res: any = await apiClient.post('/auth/logout');
    return res.data || res;
  },

  getActivity: async (): Promise<ActivityLog[]> => {
    const res: any = await apiClient.get('/auth/activity');
    return res.data || res;
  },
};
