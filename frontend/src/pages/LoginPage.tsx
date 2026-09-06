import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Sparkles, Mail, Shield, Briefcase, UserCheck, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      toast.success('Signed in successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'manager' | 'member') => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(role);
      toast.success(`Logged in as ${role.toUpperCase()}!`);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Quick login failed. Please ensure backend is running.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-7 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-xl border border-white/20">
        {/* Header Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/30 text-white">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            ReportFlow
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Sign in to your account with role-based access
          </p>
        </div>

        {/* Quick 1-Click Demo Login Panel */}
        <div className="rounded-2xl bg-indigo-50/80 p-4 border border-indigo-100/90 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-2.5 flex items-center justify-between">
            <span>⚡ 1-Click Demo Logins</span>
            <span className="text-[10px] text-indigo-600 font-normal">Test all roles</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 text-xs font-bold text-purple-700 shadow-2xs border border-purple-100 hover:bg-purple-50 transition active:scale-95 disabled:opacity-50"
            >
              <Shield className="h-4 w-4 mb-1 text-purple-600" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('manager')}
              disabled={loading}
              className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 text-xs font-bold text-blue-700 shadow-2xs border border-blue-100 hover:bg-blue-50 transition active:scale-95 disabled:opacity-50"
            >
              <Briefcase className="h-4 w-4 mb-1 text-blue-600" />
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('member')}
              disabled={loading}
              className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 text-xs font-bold text-slate-700 shadow-2xs border border-slate-200 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
            >
              <UserCheck className="h-4 w-4 mb-1 text-slate-600" />
              Member
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-10"
              />
              <Mail className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full py-2.5 text-sm font-bold shadow-md mt-1" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Need an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
