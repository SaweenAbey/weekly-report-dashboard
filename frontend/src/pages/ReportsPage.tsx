import React, { useEffect, useState, useCallback } from 'react';
import { reportsApi } from '../api/reports.api';
import { projectsApi } from '../api/projects.api';
import { Report, Project, ReportStatus } from '../types';
import { ReportCard } from '../components/reports/ReportCard';
import { ReviewModal } from '../components/reports/ReviewModal';
import { CreateReportModal } from '../components/reports/CreateReportModal';
import { Spinner } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ReportStatus | ''>('');
  const [projectId, setProjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal States
  const [selectedReportForReview, setSelectedReportForReview] = useState<Report | null>(null);
  const [selectedReportForEdit, setSelectedReportForEdit] = useState<Report | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Load Projects for Filter Dropdown
  useEffect(() => {
    projectsApi.getAll({ limit: 100 }).then((res) => setProjects(res.data)).catch(console.error);
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getAll({
        page,
        limit: 9,
        search: search.trim() || undefined,
        status: status || undefined,
        project: projectId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setReports(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalItems(res.meta.total);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, projectId, startDate, endDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setProjectId('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleSubmitReport = async (report: Report) => {
    try {
      await reportsApi.submit(report._id);
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Weekly Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, and review weekly engineering reports ({totalItems} total)
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          icon={<Plus className="h-4 w-4" />}
          className="shadow-md"
        >
          Create Report
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search reports by summary, tasks, blockers..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          </div>

          {/* Status Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ReportStatus | '');
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Project Dropdown */}
          <div className="w-full md:w-52">
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  [{p.key}] {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filters & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-slate-600">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Date Range:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {(search || status || projectId || startDate || endDate) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
            >
              <RotateCcw className="h-3 w-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No reports match the selected filters.
          </p>
          <div className="mt-3">
            <Button size="sm" variant="outline" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="text-xs text-slate-500">
            Showing Page <span className="font-semibold text-slate-800">{page}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              icon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

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
