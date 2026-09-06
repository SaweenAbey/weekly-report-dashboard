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
import { RoleBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user, logout, isManager, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      setShowLogoutModal(false);
      navigate('/login');
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

        {/* User Profile & Logout Bottom Bar */}
        <div className="border-t border-slate-800 p-4 bg-slate-950/40">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center justify-between mb-3 hover:bg-slate-900/60 p-1.5 rounded-xl transition cursor-pointer"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={
                  user?.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`
                }
                alt={user?.name}
                className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 object-cover flex-shrink-0"
              />
              <div className="truncate">
                <div className="text-sm font-semibold text-white truncate">
                  {user?.name}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {user?.department || user?.email}
                </div>
              </div>
            </div>
          </NavLink>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            {user?.role && <RoleBadge role={user.role} />}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 transition"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Sign Out"
        description="Are you sure you want to end your current session?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            You will need to sign in again with your credentials to access your weekly reports and dashboard.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isLoggingOut}
              onClick={confirmLogout}
              icon={<LogOut className="h-3.5 w-3.5" />}
            >
              Confirm Logout
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
