import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportsApi } from '../api/reports.api';
import { Report } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ReviewHistoryTimeline } from '../components/reports/ReviewHistoryTimeline';
import { ReviewModal } from '../components/reports/ReviewModal';
import { CreateReportModal } from '../components/reports/CreateReportModal';
import { Spinner } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  ListTodo,
  Target,
  AlertTriangle,
  Send,
  Edit3,
  Trash2,
  FolderKanban,
  User,
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
    typeof report.project === 'object' ? report.project.name : 'Project';
  const projectKey =
    typeof report.project === 'object' ? report.project.key : 'PRJ';

  const authorName = report.author?.name || 'Unknown Author';
  const authorAvatar =
    report.author?.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`;

  const handleSubmit = async () => {
    try {
      await reportsApi.submit(report._id);
      fetchReport();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit report');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        await reportsApi.delete(report._id);
        navigate('/reports');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete report');
      }
    }
  };

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

      {/* Main Report Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-8">
        {/* Header Information */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center space-x-4">
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 object-cover shadow-sm"
            />
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
                <span className="flex items-center gap-1 font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                  [{projectKey}] {projectName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-xs text-slate-600 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <div className="flex items-center gap-1.5 font-medium">
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
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>{report.hoursLogged || 0} Hours Logged</span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Executive Summary
          </h2>
          <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-2xl border border-slate-100 font-medium">
            {report.summary}
          </p>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Completed Tasks */}
          <div className="rounded-2xl bg-emerald-50/40 p-5 border border-emerald-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Tasks Completed
            </h3>
            {report.tasksCompleted && report.tasksCompleted.length > 0 ? (
              <ul className="space-y-2">
                {report.tasksCompleted.map((t, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-800 flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-100 shadow-2xs"
                  >
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">None logged</p>
            )}
          </div>

          {/* In Progress Tasks */}
          <div className="rounded-2xl bg-blue-50/40 p-5 border border-blue-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
              <ListTodo className="h-4 w-4 text-blue-600" />
              In Progress
            </h3>
            {report.tasksInProgress && report.tasksInProgress.length > 0 ? (
              <ul className="space-y-2">
                {report.tasksInProgress.map((t, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-800 flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-blue-100 shadow-2xs"
                  >
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">None logged</p>
            )}
          </div>

          {/* Next Week Plans */}
          <div className="rounded-2xl bg-indigo-50/40 p-5 border border-indigo-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-indigo-600" />
              Plans For Next Week
            </h3>
            {report.plansForNextWeek && report.plansForNextWeek.length > 0 ? (
              <ul className="space-y-2">
                {report.plansForNextWeek.map((t, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-800 flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-indigo-100 shadow-2xs"
                  >
                    <span className="text-indigo-500 font-bold mt-0.5">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">None logged</p>
            )}
          </div>
        </div>

        {/* Blockers Banner */}
        {report.blockers && (
          <div className="rounded-2xl bg-amber-50 p-5 border border-amber-200/80 space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Blockers & Team Dependencies
            </h3>
            <p className="text-xs text-amber-900 leading-relaxed">
              {report.blockers}
            </p>
          </div>
        )}
      </div>

      {/* Review & Status History Timeline Section */}
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
