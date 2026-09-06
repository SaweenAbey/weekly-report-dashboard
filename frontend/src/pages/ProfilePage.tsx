import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth.api';
import { ActivityLog } from '../types';
import { RoleBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Modal';
import {
  Mail,
  Building,
  KeyRound,
  ShieldCheck,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  Laptop,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    authApi
      .getActivity()
      .then((data) => setActivityLogs(data))
      .catch(console.error)
      .finally(() => setLoadingLogs(false));
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      const err = 'New passwords do not match.';
      setPasswordError(err);
      toast.error(err);
      return;
    }

    if (newPassword.length < 6) {
      const err = 'New password must be at least 6 characters long.';
      setPasswordError(err);
      toast.error(err);
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      const msg = res.message || 'Password updated successfully!';
      setPasswordSuccess(msg);
      toast.success(msg);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Refresh activity logs
      authApi.getActivity().then(setActivityLogs).catch(console.error);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update password. Please check current password.';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'USER_LOGIN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'USER_LOGOUT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'PASSWORD_CHANGED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'REPORT_CREATED':
      case 'REPORT_SUBMITTED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REPORT_REVIEWED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Profile & Security Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your account credentials, security settings, and audit activity
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={
                user?.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`
              }
              alt={user?.name}
              className="h-16 w-16 rounded-2xl bg-slate-100 border border-slate-200 object-cover shadow-sm"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
                {user?.role && <RoleBadge role={user.role} />}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {user?.email}
                </span>
                {user?.department && (
                  <span className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    {user.department}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50 px-4 py-3 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
            <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span>Account Active & Protected with JWT Bearer Session</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Password Security Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 lg:col-span-1">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-indigo-600" />
              Change Password
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ensure your account uses a strong, secure password
            </p>
          </div>

          {passwordSuccess && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full text-xs font-bold py-2 mt-2"
              isLoading={passwordLoading}
            >
              Update Password
            </Button>
          </form>
        </div>

        {/* User Activity & Login History Timeline */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-600" />
                Recent Login & Security Activity
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit history of your recent authentication and report actions
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {activityLogs.length} events logged
            </span>
          </div>

          {loadingLogs ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
              No recent activity logs found.
            </div>
          ) : (
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div
                  key={log._id}
                  className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50/70 p-3.5 border border-slate-100"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getActionBadgeColor(
                          log.action,
                        )}`}
                      >
                        {log.action}
                      </span>
                      <time className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        {new Date(log.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">
                      {log.description}
                    </p>
                  </div>

                  {log.ip && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      <Laptop className="h-3 w-3 text-slate-400" />
                      <span>IP: {log.ip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
