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
  Edit3,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { isManager, isAdmin, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED'>('ACTIVE');

  // Validation Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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
      usersApi
        .getAll({ limit: 100 })
        .then((res) => setAllUsers(res.data))
        .catch(console.error);
    }
  }, [isManager, isAdmin]);

  const openCreateModal = () => {
    setEditingProject(null);
    setName('');
    setKey('');
    setDescription('');
    setManagerId(user?._id || user?.id || '');
    setSelectedMembers([]);
    setStartDate('');
    setEndDate('');
    setStatus('ACTIVE');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setKey(project.key);
    setDescription(project.description || '');
    setManagerId(
      typeof project.manager === 'object' ? (project.manager as User)._id || '' : project.manager,
    );
    setSelectedMembers(
      project.members?.map((m) => (typeof m === 'object' ? (m as User)._id || '' : m)) || [],
    );
    setStartDate(project.startDate ? project.startDate.split('T')[0] : '');
    setEndDate(project.endDate ? project.endDate.split('T')[0] : '');
    setStatus(project.status || 'ACTIVE');
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 1. Name validation
    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    }

    // 2. Key validation (2 to 6 uppercase alphanumeric)
    const cleanKey = key.trim().toUpperCase();
    if (!cleanKey) {
      newErrors.key = 'Project key is required';
    } else if (!/^[A-Z0-9]{2,6}$/.test(cleanKey)) {
      newErrors.key = 'Project key must be 2 to 6 uppercase letters/numbers (e.g. WRD, API, FE)';
    }

    // 3. Manager validation
    if (!managerId) {
      newErrors.managerId = 'Please select a lead manager';
    }

    // 4. Date validation
    if (startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        newErrors.dates = 'End date cannot be earlier than start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the highlighted validation errors.');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      key: key.trim().toUpperCase(),
      description: description.trim(),
      manager: managerId,
      members: selectedMembers,
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    try {
      if (editingProject) {
        await projectsApi.update(editingProject._id, payload);
        toast.success('Project updated successfully!');
      } else {
        await projectsApi.create(payload);
        toast.success('Project created successfully!');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save project. Please check fields.';
      toast.error(msg);
      setErrors((prev) => ({ ...prev, form: msg }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!window.confirm(`Are you sure you want to delete project "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await projectsApi.delete(projectId);
      toast.success(`Project "${projectName}" deleted successfully.`);
      fetchProjects();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-indigo-600" />
            <span>Projects & Work Categories</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage engineering initiatives, team assignments, and weekly report categories
          </p>
        </div>

        {(isManager || isAdmin) && (
          <Button onClick={openCreateModal} icon={<Plus className="h-4 w-4" />} className="shadow-md">
            New Project
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FolderKanban className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-900">No projects created yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Create your first project to organize and attach weekly engineering reports.
          </p>
          {(isManager || isAdmin) && (
            <div className="mt-4">
              <Button onClick={openCreateModal} size="sm">
                Create First Project
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const managerName =
              typeof project.manager === 'object'
                ? (project.manager as User).name
                : 'Assigned Manager';

            const canManage =
              isAdmin ||
              (typeof project.manager === 'object'
                ? (project.manager as User)._id === user?._id
                : project.manager === user?._id);

            return (
              <div
                key={project._id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 hover:shadow-md transition-all space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700 uppercase tracking-wider border border-indigo-100">
                      {project.key}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                        project.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : project.status === 'COMPLETED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                      {project.name}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {project.description || 'No description provided for this project.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
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
                      <span>{project.members?.length || 0} Assigned</span>
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

                  {/* Edit / Delete Buttons for Manager/Admin */}
                  {canManage && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100/80">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(project)}
                        icon={<Edit3 className="h-3.5 w-3.5" />}
                      >
                        Edit
                      </Button>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(project._id, project.name)}
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Project Modal with Full Validation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        description="Configure project name, key, lead manager, dates, and assign team members."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
              {errors.form}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Weekly Report Dashboard"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none transition ${
                errors.name
                  ? 'border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-400'
                  : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Project Key & Lead Manager */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Project Key (2-6 chars) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                  if (errors.key) setErrors((prev) => ({ ...prev, key: '' }));
                }}
                placeholder="WRD"
                maxLength={6}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-800 font-mono font-bold uppercase tracking-wider focus:outline-none transition ${
                  errors.key
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-400'
                    : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
              {errors.key ? (
                <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.key}
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-slate-400">Short abbreviation (e.g. WRD, API, FE)</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Lead Manager <span className="text-rose-500">*</span>
              </label>
              <select
                value={managerId}
                onChange={(e) => {
                  setManagerId(e.target.value);
                  if (errors.managerId) setErrors((prev) => ({ ...prev, managerId: '' }));
                }}
                className={`w-full rounded-xl border px-3 py-2.5 text-xs text-slate-800 focus:outline-none transition ${
                  errors.managerId
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-400'
                    : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              >
                <option value="">Select Lead Manager</option>
                {allUsers
                  .filter((u) => u.role === 'MANAGER' || u.role === 'ADMIN')
                  .map((u) => (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
              </select>
              {errors.managerId && (
                <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.managerId}
                </p>
              )}
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (errors.dates) setErrors((prev) => ({ ...prev, dates: '' }));
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (errors.dates) setErrors((prev) => ({ ...prev, dates: '' }));
                }}
                className={`w-full rounded-xl border px-3 py-2 text-xs text-slate-800 focus:outline-none ${
                  errors.dates
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-slate-300 bg-white focus:border-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Project Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {errors.dates && (
            <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 -mt-2">
              <AlertCircle className="h-3 w-3" />
              {errors.dates}
            </p>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project objectives and milestones..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Assign Team Members (Section 5 Requirement) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-indigo-600" />
              <span>Assign Team Members ({selectedMembers.length} selected)</span>
            </label>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-1.5">
              {allUsers.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No team members available to assign.</p>
              ) : (
                allUsers.map((u) => {
                  const uid = u._id || u.id || '';
                  const isChecked = selectedMembers.includes(uid);
                  return (
                    <label
                      key={uid}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition ${
                        isChecked
                          ? 'bg-indigo-50 border border-indigo-200 font-semibold text-indigo-900'
                          : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleMemberToggle(uid)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span>{u.name}</span>
                        <span className="text-[10px] text-slate-400">({u.role})</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{u.department || 'Engineering'}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
