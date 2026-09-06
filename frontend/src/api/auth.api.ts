import { apiClient } from './client';
import { AuthResponse, User } from '../types';

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
  }): Promise<AuthResponse> => {
    const res: any = await apiClient.post('/auth/register', data);
    return res.data || res;
  },

  getProfile: async (): Promise<User> => {
    const res: any = await apiClient.get('/auth/profile');
    return res.data || res;
  },
};
