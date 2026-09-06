import React, { useEffect, useState } from 'react';
import { usersApi } from '../api/users.api';
import { User } from '../types';
import { RoleBadge } from '../components/common/StatusBadge';
import { Spinner } from '../components/common/Modal';
import { Mail, Building } from 'lucide-react';

export const TeamPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi
      .getAll({ limit: 100 })
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Team Directory
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Engineering team members, managers, and role permissions
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((member) => (
            <div
              key={member._id || member.id}
              className="flex items-start space-x-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
            >
              <img
                src={
                  member.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                }
                alt={member.name}
                className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 object-cover"
              />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {member.name}
                  </h3>
                  <RoleBadge role={member.role} />
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                  <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>

                {member.department && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Building className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span>{member.department}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
