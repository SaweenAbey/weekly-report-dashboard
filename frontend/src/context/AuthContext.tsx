import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Role } from '../types';
import { authApi } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isTeamMember: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: Role; department?: string }) => Promise<void>;
  logout: () => void;
  quickLogin: (role: 'admin' | 'manager' | 'member') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        try {
          const profile = await authApi.getProfile();
          setUser(profile);
        } catch {
          localStorage.removeItem('access_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('access_token', data.accessToken);
      setToken(data.accessToken);
      setUser(data.user as any);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; role?: Role; department?: string }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      localStorage.setItem('access_token', res.accessToken);
      setToken(res.accessToken);
      setUser(res.user as any);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  const quickLogin = async (role: 'admin' | 'manager' | 'member') => {
    const credentials = {
      admin: { email: 'admin@example.com', password: 'Password123!' },
      manager: { email: 'sarah.manager@example.com', password: 'Password123!' },
      member: { email: 'john.dev@example.com', password: 'Password123!' },
    };

    const target = credentials[role];
    if (target) {
      await login(target.email, target.password);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER' || isAdmin;
  const isTeamMember = user?.role === 'TEAM_MEMBER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isManager,
        isTeamMember,
        login,
        register,
        logout,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
