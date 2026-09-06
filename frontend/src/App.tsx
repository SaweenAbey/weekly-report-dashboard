import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { ReportDetailsPage } from './pages/ReportDetailsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TeamPage } from './pages/TeamPage';
import { ProfilePage } from './pages/ProfilePage';
import { ActivityLogsPage } from './pages/ActivityLogsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1e293b',
            borderRadius: '16px',
            boxShadow:
              '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: '600',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:id" element={<ReportDetailsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/team"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <TeamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <ActivityLogsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
