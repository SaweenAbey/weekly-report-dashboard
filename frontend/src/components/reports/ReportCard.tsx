import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Report } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { UserAvatar } from '../common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Send,
  Edit3,
} from 'lucide-react';

interface ReportCardProps {
  report: Report;
  onReviewClick?: (report: Report) => void;
  onSubmitClick?: (report: Report) => void;
  onEditClick?: (report: Report) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onReviewClick,
  onSubmitClick,
  onEditClick,
}) => {
  const navigate = useNavigate();
  const { user, isManager, isAdmin } = useAuth();

  const isAuthor =
    report.author?._id === user?._id || report.author?.id === user?._id;
  const canEdit =
    (isAuthor &&
      (report.status === 'DRAFT' || report.status === 'CHANGES_REQUESTED')) ||
    isAdmin;
  const canSubmit = isAuthor && (report.status === 'DRAFT' || report.status === 'CHANGES_REQUESTED');
  const canReview =
    (isManager || isAdmin) &&
    (report.status === 'SUBMITTED' || report.status === 'UNDER_REVIEW');

  const projectName =
    typeof report.project === 'object' ? report.project.name : 'Project';
  const projectKey =
    typeof report.project === 'object' ? report.project.key : 'PRJ';

  const authorName = report.author?.name || 'Unknown Author';

  const startDateFormatted = new Date(report.weekStartDate).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
  const endDateFormatted = new Date(report.weekEndDate).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      {/* Top row: Author, Project, Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-3">
          <UserAvatar name={authorName} size="sm" rounded="full" />
          <div>
            <div className="text-sm font-semibold text-slate-900 leading-tight">
              {authorName}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className="font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                {projectKey}
              </span>
              <span>{projectName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* Middle: Dates, Hours, Summary */}
      <div className="my-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {startDateFormatted} – {endDateFormatted}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {report.hoursLogged || 0} hrs
          </span>
        </div>

        <p className="text-sm text-slate-700 font-normal line-clamp-2 leading-relaxed">
          {report.summary}
        </p>
      </div>

      {/* Task count summary pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs pt-1 pb-2">
        {report.tasksCompleted && report.tasksCompleted.length > 0 && (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium text-[11px] border border-emerald-100">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {report.tasksCompleted.length} Completed
          </span>
        )}
        {report.blockers && (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium text-[11px] border border-amber-100 truncate max-w-[200px]">
            <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
            Blocker: {report.blockers}
          </span>
        )}
      </div>

      {/* Latest reviewer comment if available */}
      {report.latestComment && (
        <div className="mt-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-200/60 flex items-start gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
          <span className="italic line-clamp-1">"{report.latestComment}"</span>
        </div>
      )}

      {/* Footer action buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <button
          onClick={() => navigate(`/reports/${report._id}`)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
        >
          View Details
          <ArrowRight className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center gap-2">
          {canEdit && onEditClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditClick(report)}
              icon={<Edit3 className="h-3.5 w-3.5" />}
            >
              Edit
            </Button>
          )}

          {canSubmit && onSubmitClick && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onSubmitClick(report)}
              icon={<Send className="h-3.5 w-3.5" />}
            >
              Submit
            </Button>
          )}

          {canReview && onReviewClick && (
            <Button
              size="sm"
              variant="success"
              onClick={() => onReviewClick(report)}
            >
              Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
