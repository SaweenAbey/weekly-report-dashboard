import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { projectsApi } from '../../api/projects.api';
import { reportsApi } from '../../api/reports.api';
import { Project, Report } from '../../types';
import { Plus, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (report: Report) => void;
  initialReport?: Report | null;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  initialReport,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [weekStartDate, setWeekStartDate] = useState('');
  const [weekEndDate, setWeekEndDate] = useState('');
  const [summary, setSummary] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState<string[]>(['']);
  const [tasksInProgress, setTasksInProgress] = useState<string[]>(['']);
  const [plansForNextWeek, setPlansForNextWeek] = useState<string[]>(['']);
  const [blockers, setBlockers] = useState('');
  const [hoursLogged, setHoursLogged] = useState<number>(40);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load projects list
  useEffect(() => {
    if (isOpen) {
      projectsApi
        .getAll({ limit: 100 })
        .then((res) => {
          setProjects(res.data);
          if (res.data.length > 0 && !projectId) {
            setProjectId(res.data[0]._id);
          }
        })
        .catch(console.error);

      // Default week start (Monday) and week end (Sunday)
      if (!initialReport) {
        const today = new Date();
        const day = today.getDay();
        const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diffToMonday));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        setWeekStartDate(monday.toISOString().split('T')[0]);
        setWeekEndDate(sunday.toISOString().split('T')[0]);
      } else {
        setProjectId(
          typeof initialReport.project === 'object'
            ? initialReport.project._id
            : initialReport.project,
        );
        setWeekStartDate(initialReport.weekStartDate.split('T')[0]);
        setWeekEndDate(initialReport.weekEndDate.split('T')[0]);
        setSummary(initialReport.summary);
        setTasksCompleted(
          initialReport.tasksCompleted.length ? initialReport.tasksCompleted : [''],
        );
        setTasksInProgress(
          initialReport.tasksInProgress.length ? initialReport.tasksInProgress : [''],
        );
        setPlansForNextWeek(
          initialReport.plansForNextWeek.length
            ? initialReport.plansForNextWeek
            : [''],
        );
        setBlockers(initialReport.blockers || '');
        setHoursLogged(initialReport.hoursLogged || 40);
      }
    }
  }, [isOpen, initialReport]);

  const handleArrayChange = (
    index: number,
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  };

  const handleAddItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setList([...list, '']);
  };

  const handleRemoveItem = (
    index: number,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    if (list.length === 1) {
      setList(['']);
    } else {
      setList(list.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !weekStartDate || !weekEndDate || !summary.trim()) {
      setError('Please fill in all required fields (Project, Dates, Summary).');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      project: projectId,
      weekStartDate,
      weekEndDate,
      summary: summary.trim(),
      tasksCompleted: tasksCompleted.filter((t) => t.trim() !== ''),
      tasksInProgress: tasksInProgress.filter((t) => t.trim() !== ''),
      plansForNextWeek: plansForNextWeek.filter((t) => t.trim() !== ''),
      blockers: blockers.trim(),
      hoursLogged: Number(hoursLogged),
    };

    try {
      let saved: Report;
      if (initialReport) {
        saved = await reportsApi.update(initialReport._id, payload);
      } else {
        saved = await reportsApi.create(payload);
      }
      onCreated(saved);
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to save weekly report. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialReport ? 'Edit Weekly Report' : 'Create Weekly Report'}
      description="Record your progress, ongoing tasks, plans for next week, and blockers."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {/* Project and Hours */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Project <span className="text-rose-500">*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="" disabled>
                Select Project
              </option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  [{p.key}] {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Hours Logged
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.5"
                value={hoursLogged}
                onChange={(e) => setHoursLogged(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-10"
              />
              <Clock className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Week Start / End Dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Week Start Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-10"
                required
              />
              <Calendar className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Week End Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={weekEndDate}
                onChange={(e) => setWeekEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-10"
                required
              />
              <Calendar className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
            Weekly Executive Summary <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief high-level summary of what was accomplished this week..."
            className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Tasks Completed */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase text-emerald-700">
              Tasks Completed
            </label>
            <button
              type="button"
              onClick={() => handleAddItem(tasksCompleted, setTasksCompleted)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Task
            </button>
          </div>
          <div className="space-y-2">
            {tasksCompleted.map((task, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={task}
                  placeholder={`Completed task #${idx + 1}`}
                  onChange={(e) =>
                    handleArrayChange(
                      idx,
                      e.target.value,
                      tasksCompleted,
                      setTasksCompleted,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveItem(idx, tasksCompleted, setTasksCompleted)
                  }
                  className="p-2 text-slate-400 hover:text-rose-500 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks In Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase text-blue-700">
              Tasks In Progress
            </label>
            <button
              type="button"
              onClick={() => handleAddItem(tasksInProgress, setTasksInProgress)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Task
            </button>
          </div>
          <div className="space-y-2">
            {tasksInProgress.map((task, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={task}
                  placeholder={`Ongoing task #${idx + 1}`}
                  onChange={(e) =>
                    handleArrayChange(
                      idx,
                      e.target.value,
                      tasksInProgress,
                      setTasksInProgress,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveItem(idx, tasksInProgress, setTasksInProgress)
                  }
                  className="p-2 text-slate-400 hover:text-rose-500 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Plans for Next Week */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase text-indigo-700">
              Plans For Next Week
            </label>
            <button
              type="button"
              onClick={() =>
                handleAddItem(plansForNextWeek, setPlansForNextWeek)
              }
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Plan
            </button>
          </div>
          <div className="space-y-2">
            {plansForNextWeek.map((task, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={task}
                  placeholder={`Next week milestone #${idx + 1}`}
                  onChange={(e) =>
                    handleArrayChange(
                      idx,
                      e.target.value,
                      plansForNextWeek,
                      setPlansForNextWeek,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveItem(idx, plansForNextWeek, setPlansForNextWeek)
                  }
                  className="p-2 text-slate-400 hover:text-rose-500 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Blockers */}
        <div>
          <label className="block text-xs font-semibold uppercase text-amber-700 mb-1 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            Blockers & Dependencies (Optional)
          </label>
          <textarea
            rows={2}
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            placeholder="Any bottlenecks, missing credentials, or team dependencies..."
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {initialReport ? 'Update Report' : 'Save as Draft'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
