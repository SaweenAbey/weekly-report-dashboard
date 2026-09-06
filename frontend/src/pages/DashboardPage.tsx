import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { reportsApi } from '../api/reports.api';
import { Report } from '../types';
import { ReportCard } from '../components/reports/ReportCard';
import { ReviewModal } from '../components/reports/ReviewModal';
import { CreateReportModal } from '../components/reports/CreateReportModal';
import { Spinner } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { isManager } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'changes'>('all');
  const [selectedReportForReview, setSelectedReportForReview] = useState<Report | null>(null);
  const [selectedReportForEdit, setSelectedReportForEdit] = useState<Report | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getAll({ limit: 20 });
      setReports(res.data);
    } catch (err) {
      console.error('Failed to load dashboard reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    const handleReportCreated = () => fetchReports();
    window.addEventListener('report-created', handleReportCreated);
    return () => window.removeEventListener('report-created', handleReportCreated);
  }, []);

  const totalReports = reports.length;
  const pendingReview = reports.filter((r) => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
  const approved = reports.filter((r) => r.status === 'APPROVED').length;
  const changesRequested = reports.filter((r) => r.status === 'CHANGES_REQUESTED').length;

  const filteredReports = reports.filter((r) => {
    if (activeTab === 'pending') return r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW';
    if (activeTab === 'approved') return r.status === 'APPROVED';
    if (activeTab === 'changes') return r.status === 'CHANGES_REQUESTED';
    return true;
  });

  const handleSubmitReport = async (report: Report) => {
    try {
      await reportsApi.submit(report._id);
      toast.success('Report submitted for manager review!');
      fetchReports();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-400/30">
              Weekly Reporting Cycle
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isManager ? 'Team Reports & Review Center' : 'Your Weekly Progress'}
            </h1>
            <p className="text-sm text-indigo-200/90 leading-relaxed">
              {isManager
                ? 'Track project progress, unblock team bottlenecks, and review submitted weekly engineering reports.'
                : 'Keep your team aligned by logging your tasks, next week roadmap, blockers, and hours.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="white"
              icon={<Plus className="h-4 w-4 text-indigo-700" />}
            >
              New Weekly Report
            </Button>
            <Link to="/reports">
              <Button
                variant="glass"
                icon={<ArrowUpRight className="h-4 w-4" />}
              >
                View All
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Total Reports
            </span>
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">{totalReports}</div>
          <p className="mt-1 text-xs text-slate-500">In current reporting scope</p>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-blue-700 tracking-wider">
              Pending Review
            </span>
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-blue-900">{pendingReview}</div>
          <p className="mt-1 text-xs text-blue-600">Awaiting manager review</p>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-emerald-700 tracking-wider">
              Approved
            </span>
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-900">{approved}</div>
          <p className="mt-1 text-xs text-emerald-600">Milestones confirmed</p>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-amber-700 tracking-wider">
              Changes Requested
            </span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-900">{changesRequested}</div>
          <p className="mt-1 text-xs text-amber-600">Requires author update</p>
        </div>
      </div>

      {/* Tab filter and Recent Submissions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {isManager ? 'Recent Team Submissions' : 'Your Recent Reports'}
            </h2>
            <p className="text-xs text-slate-500">
              Latest submissions across all assigned projects
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center space-x-1 rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeTab === 'all'
                  ? 'bg-white font-bold text-slate-900 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              All ({totalReports})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeTab === 'pending'
                  ? 'bg-white font-bold text-blue-700 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Pending ({pendingReview})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeTab === 'approved'
                  ? 'bg-white font-bold text-emerald-700 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Approved ({approved})
            </button>
            <button
              onClick={() => setActiveTab('changes')}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeTab === 'changes'
                  ? 'bg-white font-bold text-amber-700 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Changes ({changesRequested})
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-900">No reports found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'all'
                ? 'No weekly reports submitted yet. Create your first report to get started!'
                : `No reports currently matching the '${activeTab}' status.`}
            </p>
            <div className="mt-5">
              <Button onClick={() => setIsCreateOpen(true)} size="sm">
                Create First Report
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                onReviewClick={(r) => setSelectedReportForReview(r)}
                onSubmitClick={handleSubmitReport}
                onEditClick={(r) => setSelectedReportForEdit(r)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <ReviewModal
        isOpen={!!selectedReportForReview}
        onClose={() => setSelectedReportForReview(null)}
        report={selectedReportForReview}
        onReviewed={() => {
          setSelectedReportForReview(null);
          fetchReports();
        }}
      />

      {/* Create / Edit Dialog */}
      <CreateReportModal
        isOpen={isCreateOpen || !!selectedReportForEdit}
        onClose={() => {
          setIsCreateOpen(false);
          setSelectedReportForEdit(null);
        }}
        initialReport={selectedReportForEdit}
        onCreated={() => {
          setIsCreateOpen(false);
          setSelectedReportForEdit(null);
          fetchReports();
        }}
      />
    </div>
  );
};
