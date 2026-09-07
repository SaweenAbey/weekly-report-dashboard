import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Role } from '../types';
import {
  Sparkles,
  Mail,
  User,
  Eye,
  EyeOff,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('TEAM_MEMBER');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccessPending, setIsSuccessPending] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, text: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { level: 2, text: 'Fair', color: 'bg-amber-500' };
    return { level: 3, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await register({
        name,
        email,
        password,
        role,
        department: department || undefined,
      });

      toast.success(
        res.message ||
        'Account created! Awaiting admin approval before you can log in.',
        { duration: 6000 },
      );
      setIsSuccessPending(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Registration failed. Email may already be in use.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccessPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6 rounded-3xl bg-white/95 p-8 text-center shadow-2xl backdrop-blur-xl border border-white/20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-md">
            <Clock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Registration Submitted!
            </h2>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              Pending Admin Approval
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              Your account has been created successfully for{' '}
              <strong className="text-slate-900">{email}</strong> as a{' '}
              <strong className="text-indigo-600">
                {role === 'MANAGER' ? 'Manager' : 'Team Member'}
              </strong>
              .
            </p>
            <p className="text-xs text-slate-500">
              For security compliance, an administrator must review and approve
              your account before you can log in.
            </p>
          </div>

          <div className="pt-4">
            <Button
              className="w-full text-sm font-bold py-2.5 shadow-md"
              onClick={() => navigate('/login')}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Return to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-xl border border-white/20">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/30 text-white">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            Join ReportFlow
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Create an account with role-based dashboard access
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Connor"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-10"
              />
              <User className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Work Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@company.com"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-10"
              />
              <Mail className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
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

            {/* Password strength indicator */}
            {password && (
              <div className="mt-1.5 flex items-center gap-2 text-xs">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-1">
                  <div
                    className={`h-full flex-1 ${strength.level >= 1 ? strength.color : ''
                      }`}
                  ></div>
                  <div
                    className={`h-full flex-1 ${strength.level >= 2 ? strength.color : ''
                      }`}
                  ></div>
                  <div
                    className={`h-full flex-1 ${strength.level >= 3 ? strength.color : ''
                      }`}
                  ></div>
                </div>
                <span className="font-semibold text-[11px] text-slate-600">
                  {strength.text}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Role Assignment <span className="text-rose-500">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="TEAM_MEMBER">Team Member</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Engineering"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-200/80">
            ℹ️ <strong>Note:</strong> New accounts require Administrator approval
            before sign-in is allowed.
          </div>

          <Button
            type="submit"
            className="w-full py-2.5 text-sm font-bold shadow-md mt-1"
            isLoading={loading}
          >
            Submit for Approval
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an approved account?{' '}
          <Link
            to="/login"
            className="font-bold text-indigo-600 hover:text-indigo-800"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
