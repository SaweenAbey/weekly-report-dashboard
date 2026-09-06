import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Plus, Bell } from 'lucide-react';
import { Button } from '../common/Button';
import { UserAvatar } from '../common/UserAvatar';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenSidebar: () => void;
  onOpenCreateReport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSidebar,
  onOpenCreateReport,
}) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenSidebar}
          aria-label="Open navigation sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100/80 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 lg:hidden border border-slate-200 transition focus:outline-none shadow-sm"
          title="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            Weekly Report Dashboard
          </h1>
          <p className="hidden sm:block text-xs text-slate-500">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onOpenCreateReport && (
          <Button
            size="sm"
            onClick={onOpenCreateReport}
            icon={<Plus className="h-4 w-4" />}
            className="shadow-sm font-semibold"
          >
            New Report
          </Button>
        )}

        <div className="relative">
          <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
          </button>
        </div>

        {/* User Initial Avatar in Header */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/20 transition"
          title={`Profile of ${user?.name}`}
        >
          <UserAvatar name={user?.name} size="sm" rounded="full" />
        </Link>
      </div>
    </header>
  );
};
