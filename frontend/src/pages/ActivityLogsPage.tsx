import React, { useEffect, useState } from 'react';
import { logsApi } from '../api/logs.api';
import { ActivityLog } from '../types';
import { Spinner } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import {
  History,
  Search,
  Clock,
  User,
  Laptop,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const ActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await logsApi.getAll({
        page,
        limit: 15,
        search: search.trim() || undefined,
        action: action || undefined,
      });
      setLogs(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalItems(res.meta.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, action]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionBadgeColor = (act: string) => {
    switch (act) {
      case 'USER_LOGIN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'USER_REGISTER':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PASSWORD_CHANGED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'REPORT_CREATED':
      case 'REPORT_SUBMITTED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REPORT_REVIEWED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REPORT_DELETED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-indigo-600" />
            Audit & Security Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System-wide activity logs, authentication events, and report audits ({totalItems} total)
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-800 border border-indigo-100">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          <span>Audit Logging Active</span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity description, user or action..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </form>

        <div className="w-full md:w-56">
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Event Types</option>
            <option value="USER_LOGIN">User Login</option>
            <option value="USER_REGISTER">User Registration</option>
            <option value="PASSWORD_CHANGED">Password Changed</option>
            <option value="REPORT_CREATED">Report Created</option>
            <option value="REPORT_SUBMITTED">Report Submitted</option>
            <option value="REPORT_REVIEWED">Report Reviewed</option>
            <option value="REPORT_DELETED">Report Deleted</option>
          </select>
        </div>
      </div>

      {/* Logs Table / Cards */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
          No activity logs found for the selected filters.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getActionBadgeColor(
                      log.action,
                    )}`}
                  >
                    {log.action}
                  </span>
                  {log.user && (
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-800">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {log.user.name} ({log.user.email})
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {log.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 flex-shrink-0">
                {log.ip && (
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-[11px]">
                    <Laptop className="h-3 w-3 text-slate-400" />
                    {log.ip}
                  </span>
                )}
                <time className="flex items-center gap-1 font-semibold text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {new Date(log.createdAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="text-xs text-slate-500">
            Page <span className="font-bold text-slate-800">{page}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span>
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
    </div>
  );
};
