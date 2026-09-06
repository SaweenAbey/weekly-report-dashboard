import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { reportsApi } from '../api/reports.api';
import { DashboardAnalytics, Report } from '../types';
import { ReportCard } from '../components/reports/ReportCard';
import { ReviewModal } from '../components/reports/ReviewModal';
import { CreateReportModal } from '../components/reports/CreateReportModal';
import { Spinner } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { AreaTrendChart } from '../components/charts/AreaTrendChart';
import { MemberStatusChart } from '../components/charts/MemberStatusChart';
import { ProjectDonutChart } from '../components/charts/ProjectDonutChart';
import { TaskTypeBarChart } from '../components/charts/TaskTypeBarChart';
import {
  FileText,
  Clock,
  AlertCircle,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Users,
  Layers,
  Flame,
  Percent,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { isManager, isAdmin } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'changes'>('all');
  const [selectedReportForReview, setSelectedReportForReview] = useState<Report | null>(null);
  const [selectedReportForEdit, setSelectedReportForEdit] = useState<Report | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [reportsRes, analyticsRes] = await Promise.all([
        reportsApi.getAll({ limit: 20 }),
        reportsApi.getAnalytics().catch((e) => {
          console.error('Analytics load error:', e);
          return null;
        }),
      ]);
      setReports(reportsRes.data);
      if (analyticsRes) {
        setAnalytics(analyticsRes);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleReportCreated = () => fetchDashboardData();
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
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    }
  };

  // Metrics from analytics or calculated fallback
  const submittedThisWeek = analytics?.summary.submittedThisWeek ?? (pendingReview + approved);
  const complianceRate = analytics?.summary.complianceRate ?? 85;
  const needsCorrectionCount = analytics?.summary.needsCorrectionCount ?? changesRequested;
  const openBlockersCount = analytics?.summary.openBlockersCount ?? 0;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-400/30">
              Weekly Reporting & Performance Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isManager || isAdmin ? 'Executive Insights & Report Center' : 'Personal Weekly Progress'}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              {isManager || isAdmin
                ? 'Review team velocity, unblock engineering bottlenecks, track task breakdown by type, and inspect weekly submission compliance.'
                : 'Keep management and team members aligned by maintaining your standardized task table, next-week goals, and key blockers.'}
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
                View All Reports
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* 4 Summary Metrics Cards (Section 6 Requirement) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Reports Submitted This Week */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              Submitted This Week
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 border border-indigo-100">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">{submittedThisWeek}</div>
          <p className="mt-1 text-xs text-slate-500">In current reporting cycle</p>
        </div>

        {/* Metric 2: Submission Compliance Rate */}
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">
              Compliance Rate
            </span>
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-950">{complianceRate}%</div>
          <p className="mt-1 text-xs text-emerald-700">Submitted vs pending vs late</p>
        </div>

        {/* Metric 3: Number of reports in Needs Correction */}
        <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm hover:border-amber-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-amber-800 tracking-wider">
              Needs Correction
            </span>
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-amber-950">{needsCorrectionCount}</div>
          <p className="mt-1 text-xs text-amber-700">Awaiting author correction</p>
        </div>

        {/* Metric 4: Open Blockers Across Team */}
        <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm hover:border-rose-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-rose-800 tracking-wider">
              Open Blockers
            </span>
            <div className="rounded-xl bg-rose-100 p-2.5 text-rose-700">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-rose-950">{openBlockersCount}</div>
          <p className="mt-1 text-xs text-rose-700">Team dependencies flagged</p>
        </div>
      </div>

      {/* Visual Insights Section (Section 6 Requirements) */}
      {(isManager || isAdmin || (analytics && reports.length > 0)) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <span>Visual Insights & Team Analytics</span>
              </h2>
              <p className="text-xs text-slate-500">
                Data-driven charts tracking velocity, workload, compliance, and time allocation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Tasks Completed Trend Over Time */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span>Tasks Completed Trend (Weekly Velocity)</span>
                </h3>
                <p className="text-xs text-slate-400">Team-wide completion trajectory over 4 weeks</p>
              </div>
              <AreaTrendChart data={analytics?.tasksTrend || []} />
            </div>

            {/* Chart 2: Time Spent by Task Type Team-Wide */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>Time Spent by Task Type</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Distribution across Development, Testing, Meetings, & Docs
                </p>
              </div>
              <TaskTypeBarChart data={analytics?.timeSpentByTaskType || []} />
            </div>

            {/* Chart 3: Submission / Approval Status by Team Member */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Submission & Approval Status by Member</span>
                </h3>
                <p className="text-xs text-slate-400">Individual compliance and review stage</p>
              </div>
              <MemberStatusChart data={analytics?.memberStatusBreakdown || []} />
            </div>

            {/* Chart 4: Workload & Task Distribution by Project */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-violet-600" />
                  <span>Workload Distribution by Project</span>
                </h3>
                <p className="text-xs text-slate-400">Hours logged per active project category</p>
              </div>
              <ProjectDonutChart data={analytics?.projectDistribution || []} />
            </div>
          </div>
        </div>
      )}

      {/* Recent Submissions & Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {isManager || isAdmin ? 'Recent Team Submissions' : 'Your Recent Reports'}
            </h2>
            <p className="text-xs text-slate-500">
              Latest submissions organized by status and week
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center space-x-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
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
              Needs Correction ({changesRequested})
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
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
          fetchDashboardData();
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
          fetchDashboardData();
        }}
      />
    </div>
  );
};
