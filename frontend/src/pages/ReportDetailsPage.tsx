import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { reportsApi } from '../api/reports.api';
import { Report, ReportVersionItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ReviewHistoryTimeline } from '../components/reports/ReviewHistoryTimeline';
import { ReviewModal } from '../components/reports/ReviewModal';
import { CreateReportModal } from '../components/reports/CreateReportModal';
import { Spinner, Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { UserAvatar } from '../components/common/UserAvatar';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Target,
  AlertTriangle,
  Send,
  Edit3,
  Trash2,
  FolderKanban,
  User,
  History,
  Trophy,
  Flame,
  Star,
  Link as LinkIcon,
  Eye,
} from 'lucide-react';

export const ReportDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isManager, isAdmin } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<ReportVersionItem | null>(null);

  const fetchReport = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await reportsApi.getById(id);
      setReport(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to load report details.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <h2 className="text-base font-bold text-rose-800">Error Loading Report</h2>
        <p className="mt-1 text-sm text-rose-600">{error || 'Report not found'}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => navigate('/reports')}
        >
          Back to Reports
        </Button>
      </div>
    );
  }

  const isAuthor =
    report.author?._id === user?._id || report.author?.id === user?._id;
  const canEdit =
    (isAuthor &&
      (report.status === 'DRAFT' || report.status === 'CHANGES_REQUESTED')) ||
    isAdmin;
  const canSubmit =
    isAuthor &&
    (report.status === 'DRAFT' || report.status === 'CHANGES_REQUESTED');
  const canReview =
    (isManager || isAdmin) &&
    (report.status === 'SUBMITTED' || report.status === 'UNDER_REVIEW');
  const canDelete =
    (isAuthor && report.status === 'DRAFT') || isAdmin;

  const projectName =
    typeof report.project === 'object' && report.project
      ? report.project.name || 'Project'
      : 'Project';
  const projectKey =
    typeof report.project === 'object' && report.project
      ? report.project.key || 'PRJ'
      : 'PRJ';

  const authorName = report.author?.name || 'Unknown Author';

  const handleSubmit = async () => {
    try {
      await reportsApi.submit(report._id);
      toast.success('Report submitted for manager review!');
      fetchReport();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        await reportsApi.delete(report._id);
        toast.success('Report deleted successfully');
        navigate('/reports');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete report');
      }
    }
  };

  // Find key blocker and key achievement
  const keyBlocker = report.blockersList?.find((b) => b.isKeyIssue);
  const otherBlockers = report.blockersList?.filter((b) => !b.isKeyIssue) || [];

  const keyAchievement = report.achievementsList?.find((a) => a.isKeyAchievement);
  const otherAchievements =
    report.achievementsList?.filter((a) => !a.isKeyAchievement) || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate('/reports')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </button>

        <div className="flex items-center gap-2">
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-rose-600 hover:bg-rose-50 border-rose-200"
              icon={<Trash2 className="h-4 w-4" />}
            >
              Delete
            </Button>
          )}

          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              icon={<Edit3 className="h-4 w-4" />}
            >
              Edit Report
            </Button>
          )}

          {canSubmit && (
            <Button
              size="sm"
              onClick={handleSubmit}
              icon={<Send className="h-4 w-4" />}
            >
              Submit for Review
            </Button>
          )}

          {canReview && (
            <Button
              variant="success"
              size="sm"
              onClick={() => setIsReviewModalOpen(true)}
            >
              Review Report
            </Button>
          )}
        </div>
      </div>

      {/* Needs Correction Prominent Alert Banner (Section 3) */}
      {report.status === 'CHANGES_REQUESTED' && (
        <div className="rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-white font-black text-xs shadow-sm">
                !
              </span>
              <h2 className="text-base font-bold text-amber-900">
                Action Required: Needs Correction
              </h2>
            </div>
            <p className="text-xs text-amber-950 font-medium leading-relaxed pl-9">
              <span className="font-bold">Manager Feedback: </span>
              {report.latestComment ||
                'Manager requested changes. Please adjust the report fields and resubmit for another review.'}
            </p>
          </div>

          {canEdit && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsEditModalOpen(true)}
              icon={<Edit3 className="h-4 w-4" />}
              className="flex-shrink-0 bg-amber-600 hover:bg-amber-700 border-amber-600"
            >
              Edit & Resubmit
            </Button>
          )}
        </div>
      )}

      {/* Main Standardized Report Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-8">
        {/* Header Information */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center space-x-4">
            <UserAvatar name={authorName} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{authorName}</h1>
                <StatusBadge status={report.status} size="md" />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {report.author?.department || 'Engineering'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                  <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                  [{projectKey}] {projectName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-xs text-slate-600 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span>
                {new Date(report.weekStartDate).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                –{' '}
                {new Date(report.weekEndDate).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              <Clock className="h-3.5 w-3.5" />
              <span>{report.hoursLogged || 0} Hours Logged</span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Executive Summary
          </h2>
          <p className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 font-medium">
            {report.summary}
          </p>
        </div>

        {/* 1. Standardized Task-Level Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Tasks Completed & Ongoing (Task-Level Table)</span>
          </h2>

          {report.tasks && report.tasks.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Task Name / Feature</th>
                    <th className="px-3 py-3">Priority</th>
                    <th className="px-3 py-3">Progress (Plan vs Act)</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Hours</th>
                    <th className="px-4 py-3">Output / Deliverable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.tasks.map((task, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {task.taskName}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.priority === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : task.priority === 'HIGH'
                              ? 'bg-orange-100 text-orange-800'
                              : task.priority === 'LOW'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {task.priority || 'MEDIUM'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Plan: {task.plannedPercent ?? 100}%</span>
                            <span className="font-bold text-slate-800">
                              Act: {task.actualPercent ?? 100}%
                            </span>
                          </div>
                          <div className="w-24 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${task.actualPercent ?? 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : task.status === 'BLOCKED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.status || 'COMPLETED'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600 font-medium">
                        {task.actualHours ?? 0} hrs
                        {task.plannedHours
                          ? ` / ${task.plannedHours} plan`
                          : ''}
                      </td>
                      <td className="px-4 py-3 text-slate-600 italic">
                        {task.outputDeliverable || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : report.tasksCompleted && report.tasksCompleted.length > 0 ? (
            <ul className="space-y-2">
              {report.tasksCompleted.map((t, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-800 flex items-start gap-2 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100"
                >
                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No tasks logged.</p>
          )}
        </div>

        {/* 2. Key Highlights & Key Blockers Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Key Achievement */}
          <div className="rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 p-5 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-emerald-600" />
                <span>Key Achievement of the Week</span>
              </h3>
              {keyAchievement && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white uppercase">
                  <Star className="h-3 w-3" /> Key Win
                </span>
              )}
            </div>
            {keyAchievement ? (
              <p className="text-xs text-emerald-950 font-bold leading-relaxed bg-white/80 p-3 rounded-xl border border-emerald-200 shadow-2xs">
                {keyAchievement.description}
              </p>
            ) : otherAchievements.length > 0 ? (
              <p className="text-xs text-emerald-900 leading-relaxed font-semibold">
                {otherAchievements[0].description}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No key achievement flagged.</p>
            )}

            {otherAchievements.length > 0 && (
              <ul className="space-y-1.5 pt-2 border-t border-emerald-100 text-xs text-emerald-900">
                {otherAchievements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{item.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Key Blocker / Issue */}
          <div className="rounded-2xl bg-gradient-to-tr from-amber-500/10 to-orange-500/5 p-5 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Key Blocker / Challenge</span>
              </h3>
              {keyBlocker && (
                <span className="flex items-center gap-1 rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-extrabold text-white uppercase">
                  <Flame className="h-3 w-3" /> Key Issue
                </span>
              )}
            </div>
            {keyBlocker ? (
              <p className="text-xs text-amber-950 font-bold leading-relaxed bg-white/80 p-3 rounded-xl border border-amber-200 shadow-2xs">
                {keyBlocker.description}
              </p>
            ) : report.blockers ? (
              <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                {report.blockers}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No blockers logged for this week.</p>
            )}

            {otherBlockers.length > 0 && (
              <ul className="space-y-1.5 pt-2 border-t border-amber-100 text-xs text-amber-900">
                {otherBlockers.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{item.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 3. Plans for Next Week */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Target className="h-4 w-4 text-blue-600" />
            <span>Plans & Milestones For Next Week</span>
          </h2>
          {report.plansForNextWeek && report.plansForNextWeek.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {report.plansForNextWeek.map((plan, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/40 border border-blue-100 text-xs font-medium text-slate-800"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{plan}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No next-week plans recorded.</p>
          )}
        </div>

        {/* 4. Hours Breakdown by Task Type */}
        {report.hoursBreakdown && (
          <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-600" />
                <span>Hours Worked Breakdown</span>
              </h3>
              <span className="text-xs font-black text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                Total: {report.hoursLogged} hrs
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Development</div>
                <div className="text-base font-black text-indigo-600 mt-0.5">
                  {report.hoursBreakdown.development ?? 0} <span className="text-xs font-normal">hrs</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Testing / QA</div>
                <div className="text-base font-black text-cyan-600 mt-0.5">
                  {report.hoursBreakdown.testing ?? 0} <span className="text-xs font-normal">hrs</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Meetings</div>
                <div className="text-base font-black text-violet-600 mt-0.5">
                  {report.hoursBreakdown.meetings ?? 0} <span className="text-xs font-normal">hrs</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Documentation</div>
                <div className="text-base font-black text-amber-600 mt-0.5">
                  {report.hoursBreakdown.documentation ?? 0} <span className="text-xs font-normal">hrs</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Other / Admin</div>
                <div className="text-base font-black text-slate-600 mt-0.5">
                  {report.hoursBreakdown.other ?? 0} <span className="text-xs font-normal">hrs</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Notes or Links */}
        {report.notesOrLinks && (
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <LinkIcon className="h-3.5 w-3.5 text-slate-500" />
              Attached Links & Reference Notes:
            </span>
            <span className="text-indigo-600 break-all font-mono">
              {report.notesOrLinks}
            </span>
          </div>
        )}
      </div>

      {/* Version History Revision Drawer / Section (Requirement 3) */}
      {report.versionHistory && report.versionHistory.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-600" />
                <span>Correction & Revision Version History</span>
              </h2>
              <p className="text-xs text-slate-500">
                Audit trail of past revisions submitted during manager correction cycles
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              {report.versionHistory.length} Previous Version(s)
            </span>
          </div>

          <div className="space-y-3">
            {report.versionHistory.map((ver) => (
              <div
                key={ver.versionNumber}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">
                      Revision v{ver.versionNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Submitted on {new Date(ver.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  {ver.reviewComment && (
                    <p className="text-xs text-amber-800">
                      <span className="font-bold">Manager Review Comment: </span>
                      "{ver.reviewComment}"
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingVersion(ver)}
                  icon={<Eye className="h-3.5 w-3.5" />}
                >
                  View Snapshot
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review History Audit Timeline Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Review & Status History
          </h2>
          <p className="text-xs text-slate-500">
            Chronological audit log of all manager reviews, status transitions, and comments.
          </p>
        </div>

        <ReviewHistoryTimeline history={report.reviewHistory || []} />
      </div>

      {/* Snapshot Viewer Modal */}
      {viewingVersion && (
        <Modal
          isOpen={true}
          onClose={() => setViewingVersion(null)}
          title={`Snapshot for Revision v${viewingVersion.versionNumber}`}
          description={`Captured at ${new Date(viewingVersion.submittedAt).toLocaleString()}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {viewingVersion.reviewComment && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <span className="font-bold">Comment made against this revision: </span>
                {viewingVersion.reviewComment}
              </div>
            )}

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Executive Summary</div>
              <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl mt-1">
                {viewingVersion.snapshot.summary}
              </p>
            </div>

            {viewingVersion.snapshot.tasks && viewingVersion.snapshot.tasks.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Tasks</div>
                <div className="space-y-1.5">
                  {viewingVersion.snapshot.tasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800">{t.taskName}</span>
                      <span className="text-slate-500 text-[11px]">{t.status} • {t.actualHours} hrs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <Button size="sm" variant="outline" onClick={() => setViewingVersion(null)}>
                Close Snapshot
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Review Dialog */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        report={report}
        onReviewed={(updated) => {
          setIsReviewModalOpen(false);
          setReport(updated);
        }}
      />

      {/* Edit Dialog */}
      <CreateReportModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialReport={report}
        onCreated={(updated) => {
          setIsEditModalOpen(false);
          setReport(updated);
        }}
      />
    </div>
  );
};
