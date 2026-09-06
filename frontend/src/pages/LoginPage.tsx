import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Sparkles, Lock, Mail, Shield, Briefcase, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid credentials. Please verify and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'manager' | 'member') => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Quick login failed. Please ensure the backend is running.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-xl border border-white/20">
        {/* Header Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/30 text-white">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            ReportFlow Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to manage your weekly engineering reports
          </p>
        </div>

        {/* Quick 1-Click Demo Login Panel */}
        <div className="rounded-2xl bg-indigo-50/70 p-4 border border-indigo-100/80">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2.5 flex items-center justify-between">
            <span>⚡ Quick 1-Click Demo Login</span>
            <span className="text-[10px] text-indigo-600 font-normal">Pre-seeded roles</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 text-xs font-semibold text-purple-700 shadow-sm border border-purple-100 hover:bg-purple-50 transition active:scale-95 disabled:opacity-50"
            >
              <Shield className="h-4 w-4 mb-1 text-purple-600" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('manager')}
              disabled={loading}
              className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 text-xs font-semibold text-blue-700 shadow-sm border border-blue-100 hover:bg-blue-50 transition active:scale-95 disabled:opacity-50"
            >
              <Briefcase className="h-4 w-4 mb-1 text-blue-600" />
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('member')}
              disabled={loading}
              className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
            >
              <UserCheck className="h-4 w-4 mb-1 text-slate-600" />
              Member
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-4 text-xs font-medium text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-10"
              />
              <Mail className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-10"
              />
              <Lock className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <Button type="submit" className="w-full py-2.5 text-sm font-bold shadow-lg" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
