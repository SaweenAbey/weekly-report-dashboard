import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { reportsApi } from '../api/reports.api';
import { Report, ReportStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Spinner } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  Trophy,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Edit3,
  Send,
  Trash2,
} from 'lucide-react';

export const MyReportsHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMyReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getAll({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        author: user?.id || (user as any)?._id,
      });
      setReports(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalCount(res.meta.total);
    } catch (err) {
      console.error('Failed to load my reports:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, user]);

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  const handleSubmitDraft = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoading(reportId);
    try {
      await reportsApi.submit(reportId);
      toast.success('Report submitted to manager for review!');
      fetchMyReports();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDraft = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this draft report?')) return;
    setActionLoading(reportId);
    try {
      await reportsApi.delete(reportId);
      toast.success('Draft report deleted');
      fetchMyReports();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete report');
    } finally {
      setActionLoading(null);
    }
  };

  // Metric stats
  const approvedCount = reports.filter((r) => r.status === 'APPROVED').length;
  const changesRequestedCount = reports.filter((r) => r.status === 'CHANGES_REQUESTED').length;
  const totalHoursLogged = reports.reduce((acc, r) => acc + (r.hoursLogged || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-7 w-7 text-indigo-600" />
            My Report History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track your personal weekly submissions, review decisions, and revision logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/reports/new')}
            icon={<Plus className="h-4 w-4" />}
            className="shadow-md shadow-indigo-600/20"
          >
            Create New Weekly Report
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Submitted</span>
            <FileText className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Lifetime reports</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Approved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-2">{approvedCount}</div>
          <p className="text-[11px] text-emerald-600 mt-0.5">Manager approved</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Needs Correction</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2">{changesRequestedCount}</div>
          <p className="text-[11px] text-amber-600 mt-0.5">Requires update</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Hours Logged</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalHoursLogged}h</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across displayed reports</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setPage(1);
              }}
              className={`rounded-lg px-3.5 py-1.5 whitespace-nowrap transition ${
                statusFilter === 'ALL'
                  ? 'bg-white font-bold text-slate-900 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => {
                setStatusFilter('APPROVED');
                setPage(1);
              }}
              className={`rounded-lg px-3.5 py-1.5 whitespace-nowrap transition ${
                statusFilter === 'APPROVED'
                  ? 'bg-white font-bold text-emerald-800 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => {
                setStatusFilter('CHANGES_REQUESTED');
                setPage(1);
              }}
              className={`rounded-lg px-3.5 py-1.5 whitespace-nowrap transition ${
                statusFilter === 'CHANGES_REQUESTED'
                  ? 'bg-white font-bold text-amber-800 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Needs Correction
            </button>
            <button
              onClick={() => {
                setStatusFilter('SUBMITTED');
                setPage(1);
              }}
              className={`rounded-lg px-3.5 py-1.5 whitespace-nowrap transition ${
                statusFilter === 'SUBMITTED'
                  ? 'bg-white font-bold text-blue-800 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Submitted / Under Review
            </button>
            <button
              onClick={() => {
                setStatusFilter('DRAFT');
                setPage(1);
              }}
              className={`rounded-lg px-3.5 py-1.5 whitespace-nowrap transition ${
                statusFilter === 'DRAFT'
                  ? 'bg-white font-bold text-slate-900 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Drafts
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search summary, blockers..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No reports found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              You don't have any reports matching the current filter. Create your first weekly report to get started!
            </p>
          </div>
          <Button
            onClick={() => navigate('/reports/new')}
            icon={<Plus className="h-4 w-4" />}
            className="shadow-sm"
          >
            Create Weekly Report
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const project =
              typeof report.project === 'object' && report.project
                ? report.project
                : { name: 'Engineering Project', key: 'ENG' };
            const projectName = project.name;
            const projectKey = project.key;

            const weekRange = `${new Date(report.weekStartDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })} – ${new Date(report.weekEndDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}`;

            const taskCount = report.tasks?.length || report.tasksCompleted?.length || 0;
            const completedTasks =
              report.tasks?.filter((t) => t.status === 'COMPLETED').length ||
              report.tasksCompleted?.length ||
              0;

            const keyBlocker = report.blockersList?.find((b) => b.isKeyIssue);
            const keyAchievement = report.achievementsList?.find((a) => a.isKeyAchievement);

            const isEditable =
              report.status === 'DRAFT' || report.status === 'CHANGES_REQUESTED';

            return (
              <div
                key={report._id}
                onClick={() => navigate(`/reports/${report._id}`)}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer space-y-4"
              >
                {/* Top Row: Week & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 font-black text-xs border border-indigo-100">
                      {projectKey}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {projectName}
                        </h3>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {weekRange}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Submitted: {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={report.status} />
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed font-medium">
                  {report.summary || 'No summary overview provided.'}
                </p>

                {/* Key Highlights / Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100 font-semibold text-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>
                      {completedTasks}/{taskCount} Tasks Complete
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100 font-semibold text-slate-700">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{report.hoursLogged || 0} Hours Total</span>
                  </div>

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

                {/* Latest Manager Review Feedback (if changes requested or approved) */}
                {report.latestComment && (
                  <div
                    className={`rounded-2xl p-3.5 text-xs border ${
                      report.status === 'CHANGES_REQUESTED'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      {report.status === 'CHANGES_REQUESTED' ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                      <span>Manager Feedback:</span>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed italic">
                      "{report.latestComment}"
                    </p>
                  </div>
                )}

                {/* Bottom Quick Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-400">
                    {report.versionHistory && report.versionHistory.length > 0 && (
                      <span>{report.versionHistory.length + 1} revisions logged</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {isEditable && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Edit3 className="h-3.5 w-3.5" />}
                        onClick={() => navigate(`/reports/${report._id}/edit`)}
                      >
                        {report.status === 'CHANGES_REQUESTED' ? 'Revise Report' : 'Edit Draft'}
                      </Button>
                    )}

                    {report.status === 'DRAFT' && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={<Send className="h-3.5 w-3.5" />}
                          isLoading={actionLoading === report._id}
                          onClick={(e) => handleSubmitDraft(report._id, e)}
                        >
                          Submit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                          isLoading={actionLoading === report._id}
                          onClick={(e) => handleDeleteDraft(report._id, e)}
                        >
                          Delete
                        </Button>
                      </>
                    )}

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/reports/${report._id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
