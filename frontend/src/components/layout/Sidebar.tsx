import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  LogOut,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { logout, isManager, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      to: '/reports',
      label: 'Weekly Reports',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      to: '/projects',
      label: 'Projects',
      icon: <FolderKanban className="w-5 h-5" />,
    },
    ...(isManager || isAdmin
      ? [
          {
            to: '/team',
            label: 'Team Members',
            icon: <Users className="w-5 h-5" />,
          },
          {
            to: '/logs',
            label: 'Audit & Activity Logs',
            icon: <ShieldCheck className="w-5 h-5" />,
          },
        ]
      : []),
    {
      to: '/profile',
      label: 'Profile & Security',
      icon: <UserCheck className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-slate-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 shadow-md shadow-indigo-500/30 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">ReportFlow</span>
              <span className="block text-[10px] font-medium text-slate-400 -mt-1 uppercase tracking-wider">Dashboard</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Main Menu
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout Bottom Bar */}
        <div className="border-t border-slate-800 p-4 bg-slate-950/40">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 border border-slate-700/60 px-4 py-2.5 text-xs font-bold text-slate-300 transition-all cursor-pointer disabled:opacity-50"
            title="Log out of session"
          >
            <LogOut className="h-4 w-4" />
            <span>{isLoggingOut ? 'Logging out...' : 'Sign Out / Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
