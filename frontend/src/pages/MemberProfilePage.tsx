import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usersApi } from '../api/users.api';
import { reportsApi } from '../api/reports.api';
import { User, Report } from '../types';
import { useAuth } from '../context/AuthContext';
import { RoleBadge, StatusBadge } from '../components/common/StatusBadge';
import { Spinner } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { UserAvatar } from '../components/common/UserAvatar';
import {
  ArrowLeft,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trophy,
  FileText,
  Calendar,
  ChevronRight,
  UserCheck,
  UserX,
  BarChart2,
} from 'lucide-react';

export const MemberProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();

  const [member, setMember] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMemberData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [userData, reportsData] = await Promise.all([
        usersApi.getById(id),
        reportsApi.getAll({ author: id, limit: 100 }),
      ]);
      setMember(userData);
      setReports(reportsData.data);
    } catch (err: any) {
      console.error('Failed to load member profile:', err);
      toast.error(err.response?.data?.message || 'Failed to load member details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMemberData();
  }, [fetchMemberData]);

  const handleApprove = async () => {
    if (!member?._id) return;
    setActionLoading(true);
    try {
      await usersApi.approve(member._id);
      toast.success(`Account approved for ${member.name}`);
      fetchMemberData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!member?._id) return;
    setActionLoading(true);
    try {
      await usersApi.toggleActive(member._id);
      toast.success(member.isActive ? 'Account deactivated' : 'Account activated');
      fetchMemberData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
        <h3 className="text-base font-bold text-slate-900">Member Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested team member profile could not be located.
        </p>
        <Button onClick={() => navigate('/team')} icon={<ArrowLeft className="h-4 w-4" />}>
          Back to Team Directory
        </Button>
      </div>
    );
  }

  // Calculate Basic Stats
  const totalReports = reports.length;
  const approvedReports = reports.filter((r) => r.status === 'APPROVED').length;
  const changesRequested = reports.filter((r) => r.status === 'CHANGES_REQUESTED').length;
  const pendingReview = reports.filter((r) => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
  const totalHours = reports.reduce((acc, r) => acc + (r.hoursLogged || 0), 0);
  const avgHoursPerReport = totalReports > 0 ? (totalHours / totalReports).toFixed(1) : '0';
  const approvalRate = totalReports > 0 ? Math.round((approvedReports / totalReports) * 100) : 0;

  // Task Category Hours breakdown for this member
  const taskHours = {
    development: 0,
    testing: 0,
    meetings: 0,
    documentation: 0,
    other: 0,
  };

  reports.forEach((r) => {
    if (r.hoursBreakdown) {
      taskHours.development += r.hoursBreakdown.development || 0;
      taskHours.testing += r.hoursBreakdown.testing || 0;
      taskHours.meetings += r.hoursBreakdown.meetings || 0;
      taskHours.documentation += r.hoursBreakdown.documentation || 0;
      taskHours.other += r.hoursBreakdown.other || 0;
    }
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Back link */}
      <div>
        <button
          onClick={() => navigate('/team')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Team Directory</span>
        </button>
      </div>

      {/* Member Profile Header Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <UserAvatar name={member.name} size="xl" className="h-20 w-20 text-2xl shadow-md" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {member.name}
                </h1>
                <RoleBadge role={member.role} />
                {member.isApproved ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Active Member
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    Pending Approval
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{member.email}</span>
                </div>
                {member.department && (
                  <div className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span>{member.department}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin Management Actions */}
          {isAdmin && (
            <div className="flex items-center gap-2.5">
              {!member.isApproved ? (
                <Button
                  size="sm"
                  variant="success"
                  isLoading={actionLoading}
                  onClick={handleApprove}
                  icon={<UserCheck className="h-4 w-4" />}
                >
                  Approve Account
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant={member.isActive ? 'outline' : 'secondary'}
                  isLoading={actionLoading}
                  onClick={handleToggleActive}
                  icon={
                    member.isActive ? (
                      <UserX className="h-4 w-4 text-rose-500" />
                    ) : (
                      <UserCheck className="h-4 w-4 text-emerald-500" />
                    )
                  }
                >
                  {member.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Member Basic Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Reports</span>
            <FileText className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalReports}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Submitted all time</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>Approval Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-2">{approvalRate}%</div>
          <p className="text-[11px] text-emerald-600 mt-0.5">{approvedReports} approved reports</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700">
            <span>Needs Correction</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2">{changesRequested}</div>
          <p className="text-[11px] text-amber-600 mt-0.5">{pendingReview} pending review</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Hours Logged</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalHours}h</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Avg {avgHoursPerReport}h / report</p>
        </div>
      </div>

      {/* Task Type Breakdown Card */}
      {totalHours > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-indigo-600" />
              Member Engineering Hours Breakdown
            </h3>
            <span className="text-xs font-semibold text-slate-500">{totalHours} Total Hours</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-2xl bg-indigo-50/60 p-3.5 border border-indigo-100">
              <span className="text-[11px] font-bold text-indigo-800">Development</span>
              <div className="text-lg font-black text-indigo-900 mt-1">{taskHours.development}h</div>
            </div>
            <div className="rounded-2xl bg-emerald-50/60 p-3.5 border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-800">Testing & QA</span>
              <div className="text-lg font-black text-emerald-900 mt-1">{taskHours.testing}h</div>
            </div>
            <div className="rounded-2xl bg-amber-50/60 p-3.5 border border-amber-100">
              <span className="text-[11px] font-bold text-amber-800">Meetings</span>
              <div className="text-lg font-black text-amber-900 mt-1">{taskHours.meetings}h</div>
            </div>
            <div className="rounded-2xl bg-purple-50/60 p-3.5 border border-purple-100">
              <span className="text-[11px] font-bold text-purple-800">Documentation</span>
              <div className="text-lg font-black text-purple-900 mt-1">{taskHours.documentation}h</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-700">Other</span>
              <div className="text-lg font-black text-slate-800 mt-1">{taskHours.other}h</div>
            </div>
          </div>
        </div>
      )}

      {/* Full Report History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Report History ({reports.length})
            </h2>
            <p className="text-xs text-slate-500">
              All weekly reports submitted by {member.name}
            </p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-xs text-slate-500 font-semibold">
              No weekly reports found for this team member yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const project =
                typeof report.project === 'object' && report.project
                  ? report.project
                  : { name: 'Engineering Project', key: 'ENG' };

              const weekRange = `${new Date(report.weekStartDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })} – ${new Date(report.weekEndDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}`;

              const taskCount = report.tasks?.length || 0;
              const completedTasks =
                report.tasks?.filter((t) => t.status === 'COMPLETED').length || 0;

              const keyBlocker = report.blockersList?.find((b) => b.isKeyIssue);
              const keyAchievement = report.achievementsList?.find((a) => a.isKeyAchievement);

              return (
                <div
                  key={report._id}
                  onClick={() => navigate(`/reports/${report._id}`)}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition cursor-pointer space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs border border-indigo-100">
                        {project.key}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {project.name}
                          </h4>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {weekRange}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Logged: {report.hoursLogged || 0}h
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={report.status} />
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed font-medium">
                    {report.summary || 'No summary provided'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {taskCount > 0 && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100 font-semibold text-slate-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>
                          {completedTasks}/{taskCount} Tasks Complete
                        </span>
                      </div>
                    )}

                    {keyAchievement && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 border border-amber-200 font-bold text-amber-800 text-[11px]">
                        <Trophy className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                        <span className="truncate max-w-xs">{keyAchievement.description}</span>
                      </div>
                    )}

                    {keyBlocker && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 border border-rose-200 font-bold text-rose-800 text-[11px]">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600 flex-shrink-0" />
                        <span className="truncate max-w-xs">{keyBlocker.description}</span>
                      </div>
                    )}
                  </div>

                  {report.latestComment && (
                    <div className="rounded-2xl bg-slate-50 p-3 text-xs border border-slate-200 text-slate-800">
                      <span className="font-bold text-slate-900">Manager Note:</span>{' '}
                      <span className="italic">"{report.latestComment}"</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/reports/${report._id}`);
                      }}
                    >
                      {isManager || isAdmin ? 'Review / View Report' : 'View Report'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
