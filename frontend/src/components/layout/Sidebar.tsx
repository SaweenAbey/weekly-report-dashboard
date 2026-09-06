

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  LogOut,
  Sparkles,
  ShieldCheck,
  UserCheck,
  History,
  PenSquare,
  X,
  AlertCircle,
} from 'lucide-react';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { logout, isManager, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      setShowLogoutConfirm(false);
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
      to: '/my-reports',
      label: 'My Report History',
      icon: <History className="w-5 h-5" />,
    },
    {
      to: '/reports/new',
      label: 'New Weekly Report',
      icon: <PenSquare className="w-5 h-5" />,
    },
    {
      to: '/reports',
      label: 'All Reports & Reviews',
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
            label: 'Team Directory',
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
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-slate-200 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
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
              <span className="block text-[10px] font-medium text-slate-400 -mt-1 uppercase tracking-wider">
                Dashboard
              </span>
            </div>
          </div>

          {/* Close X Button on Mobile */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition focus:outline-none"
            title="Close sidebar menu"
          >
            <X className="h-5 w-5" />
          </button>
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
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 border border-slate-700/60 px-4 py-2.5 text-xs font-bold text-slate-300 transition-all cursor-pointer"
            title="Log out of session"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out / Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        maxWidth="sm"
      >
        <div className="text-center space-y-4 pt-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertCircle className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">Sign Out Confirmation</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to sign out,{' '}
              <span className="font-semibold text-slate-700">{user?.name || 'User'}</span>? You
              will need to log in again to manage your weekly reports.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutConfirm(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<LogOut className="h-4 w-4" />}
              isLoading={isLoggingOut}
              onClick={handleConfirmLogout}
            >
              Yes, Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
