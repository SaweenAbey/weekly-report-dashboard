import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { projectsApi } from '../api/projects.api';
import { reportsApi } from '../api/reports.api';
import {
  Project,
  TaskItem,
  BlockerItem,
  AchievementItem,
  HoursBreakdown,
  TaskPriority,
  TaskStatus,
} from '../types';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Modal';
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertTriangle,
  Trophy,
  Send,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Link as LinkIcon,
  Flame,
  Star,
  FileEdit,
} from 'lucide-react';

export const PersonalReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [weekStartDate, setWeekStartDate] = useState('');
  const [weekEndDate, setWeekEndDate] = useState('');
  const [summary, setSummary] = useState('');

  // 1. Standardized Task-Level Table
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      taskName: '',
      priority: 'MEDIUM',
      plannedPercent: 100,
      actualPercent: 100,
      status: 'COMPLETED',
      plannedHours: 8,
      actualHours: 8,
      outputDeliverable: '',
    },
  ]);

  // 2. Tasks planned for next week
  const [plansForNextWeek, setPlansForNextWeek] = useState<string[]>(['']);

  // 3. Blockers / challenges with key issue flag
  const [blockersList, setBlockersList] = useState<BlockerItem[]>([
    { description: '', isKeyIssue: false },
  ]);

  // 4. Achievements / highlights with key achievement flag
  const [achievementsList, setAchievementsList] = useState<AchievementItem[]>([
    { description: '', isKeyAchievement: false },
  ]);

  // 5. Hours worked breakdown by task type
  const [hoursBreakdown, setHoursBreakdown] = useState<HoursBreakdown>({
    development: 25,
    testing: 5,
    meetings: 5,
    documentation: 5,
    other: 0,
  });

  // 6. Optional notes or links
  const [notesOrLinks, setNotesOrLinks] = useState('');

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load projects
    projectsApi
      .getAll({ limit: 100 })
      .then((res) => {
        setProjects(res.data);
        if (res.data.length > 0 && !projectId) {
          setProjectId(res.data[0]._id);
        }
      })
      .catch(console.error);

    if (isEditing && id) {
      setPageLoading(true);
      reportsApi
        .getById(id)
        .then((report) => {
          setProjectId(
            typeof report.project === 'object' && report.project ? report.project._id : (report.project || ''),
          );
          setWeekStartDate(report.weekStartDate.split('T')[0]);
          setWeekEndDate(report.weekEndDate.split('T')[0]);
          setSummary(report.summary || '');

          if (report.tasks && report.tasks.length > 0) {
            setTasks(report.tasks);
          } else if (report.tasksCompleted && report.tasksCompleted.length > 0) {
            setTasks(
              report.tasksCompleted.map((t) => ({
                taskName: t,
                priority: 'MEDIUM' as TaskPriority,
                plannedPercent: 100,
                actualPercent: 100,
                status: 'COMPLETED' as TaskStatus,
                plannedHours: 8,
                actualHours: 8,
                outputDeliverable: 'Completed milestone deliverable',
              })),
            );
          }

          if (report.plansForNextWeek && report.plansForNextWeek.length > 0) {
            setPlansForNextWeek(report.plansForNextWeek);
          }

          if (report.blockersList && report.blockersList.length > 0) {
            setBlockersList(report.blockersList);
          } else if (report.blockers) {
            setBlockersList([{ description: report.blockers, isKeyIssue: true }]);
          }

          if (report.achievementsList && report.achievementsList.length > 0) {
            setAchievementsList(report.achievementsList);
          }

          if (report.hoursBreakdown) {
            setHoursBreakdown(report.hoursBreakdown);
          }

          setNotesOrLinks(report.notesOrLinks || '');
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || 'Failed to load report for editing');
        })
        .finally(() => setPageLoading(false));
    } else {
      // Default current week Monday to Sunday
      const today = new Date();
      const day = today.getDay();
      const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diffToMonday));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      setWeekStartDate(monday.toISOString().split('T')[0]);
      setWeekEndDate(sunday.toISOString().split('T')[0]);
    }
  }, [id, isEditing]);

  // Task Table Handlers
  const handleAddTaskRow = () => {
    setTasks([
      ...tasks,
      {
        taskName: '',
        priority: 'MEDIUM',
        plannedPercent: 100,
        actualPercent: 100,
        status: 'IN_PROGRESS',
        plannedHours: 4,
        actualHours: 4,
        outputDeliverable: '',
      },
    ]);
  };

  const handleTaskChange = (index: number, field: keyof TaskItem, value: any) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    setTasks(updated);
  };

  const handleRemoveTaskRow = (index: number) => {
    if (tasks.length === 1) {
      setTasks([
        {
          taskName: '',
          priority: 'MEDIUM',
          plannedPercent: 100,
          actualPercent: 100,
          status: 'COMPLETED',
          plannedHours: 0,
          actualHours: 0,
          outputDeliverable: '',
        },
      ]);
    } else {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  // Blockers Handlers
  const handleAddBlocker = () => {
    setBlockersList([...blockersList, { description: '', isKeyIssue: false }]);
  };
  const handleBlockerChange = (index: number, description: string) => {
    const updated = [...blockersList];
    updated[index].description = description;
    setBlockersList(updated);
  };
  const handleToggleKeyIssue = (index: number) => {
    const updated = blockersList.map((b, i) => ({
      ...b,
      isKeyIssue: i === index ? !b.isKeyIssue : false,
    }));
    setBlockersList(updated);
  };
  const handleRemoveBlocker = (index: number) => {
    if (blockersList.length === 1) setBlockersList([{ description: '', isKeyIssue: false }]);
    else setBlockersList(blockersList.filter((_, i) => i !== index));
  };

  // Achievements Handlers
  const handleAddAchievement = () => {
    setAchievementsList([...achievementsList, { description: '', isKeyAchievement: false }]);
  };
  const handleAchievementChange = (index: number, description: string) => {
    const updated = [...achievementsList];
    updated[index].description = description;
    setAchievementsList(updated);
  };
  const handleToggleKeyAchievement = (index: number) => {
    const updated = achievementsList.map((a, i) => ({
      ...a,
      isKeyAchievement: i === index ? !a.isKeyAchievement : false,
    }));
    setAchievementsList(updated);
  };
  const handleRemoveAchievement = (index: number) => {
    if (achievementsList.length === 1) setAchievementsList([{ description: '', isKeyAchievement: false }]);
    else setAchievementsList(achievementsList.filter((_, i) => i !== index));
  };

  // Plans Handlers
  const handleAddPlan = () => setPlansForNextWeek([...plansForNextWeek, '']);
  const handlePlanChange = (index: number, val: string) => {
    const updated = [...plansForNextWeek];
    updated[index] = val;
    setPlansForNextWeek(updated);
  };
  const handleRemovePlan = (index: number) => {
    if (plansForNextWeek.length === 1) setPlansForNextWeek(['']);
    else setPlansForNextWeek(plansForNextWeek.filter((_, i) => i !== index));
  };

  // Total Hours Calculation
  const totalHours =
    (hoursBreakdown.development || 0) +
    (hoursBreakdown.testing || 0) +
    (hoursBreakdown.meetings || 0) +
    (hoursBreakdown.documentation || 0) +
    (hoursBreakdown.other || 0);

  const handleSubmit = async (submitForReview = false) => {
    if (!projectId || !weekStartDate || !weekEndDate || !summary.trim()) {
      const msg = 'Please fill in required fields (Project, Dates, Executive Summary).';
      setError(msg);
      toast.error(msg);
      return;
    }

    const cleanTasks = tasks.filter((t) => t.taskName.trim() !== '');
    if (cleanTasks.length === 0) {
      const msg = 'Please add at least one task to the Tasks Completed table.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError(null);

    const cleanBlockers = blockersList.filter((b) => b.description.trim() !== '');
    const cleanAchievements = achievementsList.filter((a) => a.description.trim() !== '');
    const cleanPlans = plansForNextWeek.filter((p) => p.trim() !== '');

    const payload = {
      project: projectId,
      weekStartDate,
      weekEndDate,
      summary: summary.trim(),
      tasks: cleanTasks,
      plansForNextWeek: cleanPlans,
      blockersList: cleanBlockers,
      achievementsList: cleanAchievements,
      hoursBreakdown,
      notesOrLinks: notesOrLinks.trim(),
      hoursLogged: totalHours,
      tasksCompleted: cleanTasks.map((t) => t.taskName),
      blockers: cleanBlockers.map((b) => b.description).join(', '),
    };

    try {
      if (isEditing && id) {
        await reportsApi.update(id, payload);
        if (submitForReview) {
          await reportsApi.submit(id);
          toast.success('Weekly report updated and submitted for manager review!');
        } else {
          toast.success('Weekly report updated successfully!');
        }
        navigate(`/reports/${id}`);
      } else {
        const created = await reportsApi.create(payload);
        if (submitForReview) {
          await reportsApi.submit(created._id);
          toast.success('Weekly report created and submitted for review!');
        } else {
          toast.success('Weekly report saved as Draft!');
        }
        navigate(`/reports/${created._id}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save report.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileEdit className="h-6 w-6 text-indigo-600" />
            <span>{isEditing ? 'Edit Weekly Report' : 'Create Personal Weekly Report'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fixed standardized report structure across engineering teams
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={loading}
            onClick={() => handleSubmit(false)}
            icon={<Save className="h-3.5 w-3.5" />}
          >
            {isEditing ? 'Save Changes' : 'Save as Draft'}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={loading}
            onClick={() => handleSubmit(true)}
            icon={<Send className="h-3.5 w-3.5" />}
          >
            Submit for Manager Review
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 border border-rose-200 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Report Form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        {/* 1. Date Range & Project Selector */}
        <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200/80 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-indigo-600" />
            <span>1. Week Date Range & Project Tag</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                Project / Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                Week Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                Week End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={weekEndDate}
                onChange={(e) => setWeekEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Executive Summary / Weekly Overview <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="High-level summary of key achievements, blockers resolved, and deliverables..."
            className="w-full rounded-2xl border border-slate-300 bg-white p-3.5 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            required
          />
        </div>

        {/* 2. Tasks Completed - Standardized Task-Level Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>2. Tasks Completed (Task-Level Table)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Detailed breakdown: priority, planned vs actual progress, hours, and output produced
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddTaskRow}
              icon={<Plus className="h-3.5 w-3.5 text-indigo-600" />}
            >
              Add Task Row
            </Button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 min-w-[160px]">Task Name / Feature</th>
                  <th className="px-2 py-2.5 w-24">Priority</th>
                  <th className="px-2 py-2.5 w-20">Planned %</th>
                  <th className="px-2 py-2.5 w-20">Actual %</th>
                  <th className="px-2 py-2.5 w-28">Status</th>
                  <th className="px-2 py-2.5 w-16">Plan Hrs</th>
                  <th className="px-2 py-2.5 w-16">Spent Hrs</th>
                  <th className="px-3 py-2.5 min-w-[160px]">Output / Deliverable</th>
                  <th className="px-2 py-2.5 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="p-2">
                      <input
                        type="text"
                        value={task.taskName}
                        onChange={(e) => handleTaskChange(idx, 'taskName', e.target.value)}
                        placeholder={`Task #${idx + 1} description`}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={task.priority || 'MEDIUM'}
                        onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={task.plannedPercent ?? 100}
                        onChange={(e) =>
                          handleTaskChange(idx, 'plannedPercent', Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-center text-slate-800 focus:border-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={task.actualPercent ?? 100}
                        onChange={(e) =>
                          handleTaskChange(idx, 'actualPercent', Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-center font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={task.status || 'COMPLETED'}
                        onChange={(e) => handleTaskChange(idx, 'status', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="COMPLETED">Completed</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={task.plannedHours ?? 0}
                        onChange={(e) =>
                          handleTaskChange(idx, 'plannedHours', Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-slate-300 px-1.5 py-1.5 text-xs text-center text-slate-800 focus:border-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={task.actualHours ?? 0}
                        onChange={(e) =>
                          handleTaskChange(idx, 'actualHours', Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-slate-300 px-1.5 py-1.5 text-xs text-center font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={task.outputDeliverable || ''}
                        onChange={(e) =>
                          handleTaskChange(idx, 'outputDeliverable', e.target.value)
                        }
                        placeholder="Artifact, PR #, or doc"
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveTaskRow(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Remove row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Tasks Planned for Next Week */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>3. Tasks Planned for Next Week</span>
            </label>
            <button
              type="button"
              onClick={handleAddPlan}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Planned Item
            </button>
          </div>

          <div className="space-y-2">
            {plansForNextWeek.map((plan, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-5 text-right">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={plan}
                  placeholder={`Planned milestone or deliverable #${idx + 1}`}
                  onChange={(e) => handlePlanChange(idx, e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePlan(idx)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Blockers & Challenges with Key Issue Flag */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>4. Blockers & Challenges</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Click the flame button to flag the <span className="font-bold text-amber-700">Key Issue for the week</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddBlocker}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Blocker
            </button>
          </div>

          <div className="space-y-2">
            {blockersList.map((blocker, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 p-2 rounded-xl border transition ${
                  blocker.isKeyIssue
                    ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleKeyIssue(idx)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition ${
                    blocker.isKeyIssue
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Toggle Key Issue Flag"
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>{blocker.isKeyIssue ? 'Key Issue' : 'Mark Key'}</span>
                </button>
                <input
                  type="text"
                  value={blocker.description}
                  placeholder={`Blocker or bottleneck #${idx + 1}`}
                  onChange={(e) => handleBlockerChange(idx, e.target.value)}
                  className="w-full bg-transparent px-2 py-1 text-xs text-slate-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveBlocker(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Achievements & Highlights with Key Win Flag */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-emerald-600" />
                <span>5. Achievements & Highlights</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Click the star button to flag the <span className="font-bold text-emerald-700">Key Win for the week</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddAchievement}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Achievement
            </button>
          </div>

          <div className="space-y-2">
            {achievementsList.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 p-2 rounded-xl border transition ${
                  item.isKeyAchievement
                    ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleKeyAchievement(idx)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition ${
                    item.isKeyAchievement
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Toggle Key Achievement Flag"
                >
                  <Star className="h-3.5 w-3.5" />
                  <span>{item.isKeyAchievement ? 'Key Win' : 'Mark Win'}</span>
                </button>
                <input
                  type="text"
                  value={item.description}
                  placeholder={`Major milestone win or highlight #${idx + 1}`}
                  onChange={(e) => handleAchievementChange(idx, e.target.value)}
                  className="w-full bg-transparent px-2 py-1 text-xs text-slate-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAchievement(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Hours Worked Breakdown by Task Type */}
        <div className="rounded-2xl bg-indigo-50/50 p-5 border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>6. Hours Worked Breakdown (Optional)</span>
            </div>
            <div className="text-xs font-black text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-200">
              Total: {totalHours} hrs
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Development
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={hoursBreakdown.development ?? 0}
                onChange={(e) =>
                  setHoursBreakdown({
                    ...hoursBreakdown,
                    development: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-center font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Testing / QA
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={hoursBreakdown.testing ?? 0}
                onChange={(e) =>
                  setHoursBreakdown({
                    ...hoursBreakdown,
                    testing: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-center font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Meetings
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={hoursBreakdown.meetings ?? 0}
                onChange={(e) =>
                  setHoursBreakdown({
                    ...hoursBreakdown,
                    meetings: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-center font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Documentation
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={hoursBreakdown.documentation ?? 0}
                onChange={(e) =>
                  setHoursBreakdown({
                    ...hoursBreakdown,
                    documentation: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-center font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Other / Admin
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={hoursBreakdown.other ?? 0}
                onChange={(e) =>
                  setHoursBreakdown({
                    ...hoursBreakdown,
                    other: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-center font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 7. Notes or Links */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
            <LinkIcon className="h-3.5 w-3.5 text-slate-500" />
            <span>7. Optional Notes or Links (Docs, PR URLs, Design Specs)</span>
          </label>
          <input
            type="text"
            value={notesOrLinks}
            onChange={(e) => setNotesOrLinks(e.target.value)}
            placeholder="e.g. https://github.com/org/repo/pull/124, Figma prototype link"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
