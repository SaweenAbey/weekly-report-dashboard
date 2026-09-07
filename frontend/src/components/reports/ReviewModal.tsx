import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';
import { reportsApi } from '../../api/reports.api';
import { Report, ReportStatus } from '../../types';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  onReviewed: (updated: Report) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  report,
  onReviewed,
}) => {
  const [status, setStatus] = useState<ReportStatus>('APPROVED');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      const msg = 'Please provide feedback comments for the author.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updated = await reportsApi.review(report._id, {
        status,
        comment: comment.trim(),
      });
      toast.success(`Report review submitted: ${status}!`);
      onReviewed(updated);
      onClose();
      setComment('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit review.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Weekly Report"
      description={`Reviewing report for ${report.author?.name || 'Author'} (${typeof report.project === 'object' && report.project ? report.project.name : 'Project'})`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {/* Status Selection Cards */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
            Review Decision <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setStatus('APPROVED')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                status === 'APPROVED'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <CheckCircle2
                className={`h-5 w-5 mb-1 ${
                  status === 'APPROVED' ? 'text-emerald-600' : 'text-slate-400'
                }`}
              />
              <span className="text-xs font-bold">Approve</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('CHANGES_REQUESTED')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                status === 'CHANGES_REQUESTED'
                  ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <AlertCircle
                className={`h-5 w-5 mb-1 ${
                  status === 'CHANGES_REQUESTED'
                    ? 'text-amber-600'
                    : 'text-slate-400'
                }`}
              />
              <span className="text-xs font-bold text-center">Request Changes</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('REJECTED')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                status === 'REJECTED'
                  ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <XCircle
                className={`h-5 w-5 mb-1 ${
                  status === 'REJECTED' ? 'text-rose-600' : 'text-slate-400'
                }`}
              />
              <span className="text-xs font-bold">Reject</span>
            </button>
          </div>
        </div>

        {/* Comment Box */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
            Reviewer Feedback & Comments <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write clear, constructive feedback or notes regarding the deliverables and goals..."
            className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={
              status === 'APPROVED'
                ? 'success'
                : status === 'CHANGES_REQUESTED'
                ? 'primary'
                : 'danger'
            }
            isLoading={loading}
          >
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
