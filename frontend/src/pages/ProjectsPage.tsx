import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { projectsApi } from '../api/projects.api';
import { usersApi } from '../api/users.api';
import { Project, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { Spinner, Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { UserAvatar } from '../components/common/UserAvatar';
import {
  FolderKanban,
  Plus,
  Calendar,
  Users,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { isManager, isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Project Form state
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectsApi.getAll({ limit: 50 });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    if (isManager || isAdmin) {
      usersApi.getAll({ limit: 100 }).then((res) => setAllUsers(res.data)).catch(console.error);
    }
  }, [isManager, isAdmin]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !key || !managerId) {
      setError('Name, Key, and Manager are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await projectsApi.create({
        name,
        key: key.toUpperCase(),
        description,
        manager: managerId,
        members: selectedMembers,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      toast.success('Project created successfully!');
      setIsCreateModalOpen(false);
      setName('');
      setKey('');
      setDescription('');
      setSelectedMembers([]);
      fetchProjects();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create project. Please check fields.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Projects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of company initiatives and team member assignments
          </p>
        </div>

        {(isManager || isAdmin) && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus className="h-4 w-4" />}
            className="shadow-md"
          >
            New Project
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FolderKanban className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No projects found</h3>
          <p className="mt-1 text-xs text-slate-500">
            Create your first project to start organizing team weekly reports.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const managerName =
              typeof project.manager === 'object'
                ? (project.manager as User).name
                : 'Assigned Manager';

            return (
              <div
                key={project._id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700 uppercase tracking-wider border border-indigo-100">
                      {project.key}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      {project.status}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                      {project.name}
                    </h2>
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {project.description || 'No description provided for this project.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  {/* Manager info */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Lead Manager:</span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <UserAvatar name={managerName} size="xs" rounded="full" />
                      <span>{managerName}</span>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Team Members:</span>
                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{project.members?.length || 0} Members</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  {project.startDate && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.startDate).toLocaleDateString([], {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {project.endDate && (
                        <span>
                          until{' '}
                          {new Date(project.endDate).toLocaleDateString([], {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        description="Add a new project to assign weekly reports and members."
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekly Report Dashboard"
              required
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Project Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="WRD"
                required
                maxLength={6}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 uppercase focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Lead Manager <span className="text-rose-500">*</span>
              </label>
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select Manager</option>
                {allUsers
                  .filter((u) => u.role === 'MANAGER' || u.role === 'ADMIN')
                  .map((u) => (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project objectives..."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
