import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { usersApi } from '../api/users.api';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/StatusBadge';
import { Spinner } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { UserAvatar } from '../components/common/UserAvatar';
import {
  Mail,
  Building,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserX,
  UserCheck,
} from 'lucide-react';

export const TeamPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll({ limit: 100 });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId: string, userName: string) => {
    setActionLoading(userId);
    try {
      await usersApi.approve(userId);
      toast.success(`Account approved for ${userName}! They can now log in.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to reject and remove registration request for ${userName}?`)) {
      return;
    }
    setActionLoading(userId);
    try {
      await usersApi.delete(userId);
      toast.success(`Registration request for ${userName} has been rejected.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    setActionLoading(userId);
    try {
      await usersApi.toggleActive(userId);
      toast.success(
        currentActive ? 'Account deactivated' : 'Account activated',
      );
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change user status');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingUsers = users.filter((u) => !u.isApproved);
  const approvedUsers = users.filter((u) => u.isApproved);

  const filteredUsers = users.filter((u) => {
    if (filterTab === 'pending') return !u.isApproved;
    if (filterTab === 'approved') return u.isApproved;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Team Directory & User Access
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Engineering members, role permissions, and admin approval management
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 rounded-2xl bg-purple-50 px-3.5 py-1.5 text-xs font-bold text-purple-800 border border-purple-200">
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            <span>Admin Control Active</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 w-fit">
        <button
          onClick={() => setFilterTab('all')}
          className={`rounded-lg px-3.5 py-1.5 transition ${
            filterTab === 'all'
              ? 'bg-white font-bold text-slate-900 shadow-sm'
              : 'hover:text-slate-900'
          }`}
        >
          All Users ({users.length})
        </button>
        <button
          onClick={() => setFilterTab('pending')}
          className={`rounded-lg px-3.5 py-1.5 transition ${
            filterTab === 'pending'
              ? 'bg-white font-bold text-amber-800 shadow-sm'
              : 'hover:text-slate-900'
          }`}
        >
          Pending Approval ({pendingUsers.length})
        </button>
        <button
          onClick={() => setFilterTab('approved')}
          className={`rounded-lg px-3.5 py-1.5 transition ${
            filterTab === 'approved'
              ? 'bg-white font-bold text-emerald-800 shadow-sm'
              : 'hover:text-slate-900'
          }`}
        >
          Approved ({approvedUsers.length})
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
          No users matching this tab filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((member) => {
            const memberId = member._id || member.id || '';
            const isApproved = member.isApproved ?? true;
            const isActive = member.isActive ?? true;

            return (
              <div
                key={memberId}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start space-x-3.5">
                  <UserAvatar name={member.name} size="lg" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {member.name}
                      </h3>
                      <RoleBadge role={member.role} />
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                      <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>

                    {member.department && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Building className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span>{member.department}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div>
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                        <Clock className="h-3 w-3 text-amber-600" />
                        Pending Approval
                      </span>
                    )}
                  </div>

                  {/* Admin action buttons */}
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      {!isApproved ? (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="success"
                            isLoading={actionLoading === memberId}
                            onClick={() => handleApprove(memberId, member.name)}
                            icon={<UserCheck className="h-3.5 w-3.5" />}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            isLoading={actionLoading === memberId}
                            onClick={() => handleReject(memberId, member.name)}
                            icon={<UserX className="h-3.5 w-3.5" />}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant={isActive ? 'outline' : 'secondary'}
                          isLoading={actionLoading === memberId}
                          onClick={() => handleToggleActive(memberId, isActive)}
                          icon={
                            isActive ? (
                              <UserX className="h-3.5 w-3.5 text-rose-500" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                            )
                          }
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
