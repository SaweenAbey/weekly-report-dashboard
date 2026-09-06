import React from 'react';
import { ReviewHistoryItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { MessageSquare, Calendar, User as UserIcon } from 'lucide-react';

interface ReviewHistoryTimelineProps {
  history: ReviewHistoryItem[];
}

export const ReviewHistoryTimeline: React.FC<ReviewHistoryTimelineProps> = ({
  history,
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-400 text-sm">
        <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-2" />
        No review history yet for this report.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, idx) => {
          const isLast = idx === history.length - 1;
          const reviewerName = item.reviewer?.name || 'Reviewer';
          const reviewerAvatar =
            item.reviewer?.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${reviewerName}`;

          return (
            <li key={item._id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  {/* Reviewer Avatar */}
                  <div className="relative">
                    <img
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 ring-4 ring-white border border-slate-200 object-cover"
                      src={reviewerAvatar}
                      alt={reviewerName}
                    />
                  </div>

                  <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-4 border border-slate-200/80">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm flex items-center gap-1">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          {reviewerName}
                        </span>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      <time className="flex items-center text-xs text-slate-500 gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(item.reviewedAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>

                    <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {item.comment}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
