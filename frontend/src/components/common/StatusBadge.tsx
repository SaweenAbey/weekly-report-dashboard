import React from 'react';
import { ReportStatus, Role } from '../../types';
import { CheckCircle2, Clock, AlertCircle, XCircle, FileEdit, Shield, Briefcase, User } from 'lucide-react';

interface StatusBadgeProps {
  status: ReportStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'APPROVED':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />,
          label: 'Approved',
        };
      case 'SUBMITTED':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
          dot: 'bg-blue-500',
          icon: <Clock className="w-3.5 h-3.5 mr-1 text-blue-500" />,
          label: 'Submitted',
        };
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          dot: 'bg-indigo-500',
          icon: <Clock className="w-3.5 h-3.5 mr-1 text-indigo-500" />,
          label: 'Under Review',
        };
      case 'CHANGES_REQUESTED':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500',
          icon: <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-500" />,
          label: 'Changes Requested',
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
          dot: 'bg-rose-500',
          icon: <XCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />,
          label: 'Rejected',
        };
      case 'DRAFT':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: <FileEdit className="w-3.5 h-3.5 mr-1 text-slate-400" />,
          label: 'Draft',
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${config.bg} ${sizeClasses[size]}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  switch (role) {
    case 'ADMIN':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </span>
      );
    case 'MANAGER':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          <Briefcase className="w-3 h-3 mr-1" />
          Manager
        </span>
      );
    case 'TEAM_MEMBER':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
          <User className="w-3 h-3 mr-1" />
          Member
        </span>
      );
  }
};
