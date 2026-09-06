import React from 'react';

interface TaskTypeBarChartProps {
  data: {
    type: string;
    hours: number;
  }[];
}

const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  Development: { color: 'text-indigo-600', bg: 'bg-indigo-600', border: 'border-indigo-200' },
  Testing: { color: 'text-cyan-600', bg: 'bg-cyan-600', border: 'border-cyan-200' },
  Meetings: { color: 'text-violet-600', bg: 'bg-violet-600', border: 'border-violet-200' },
  Documentation: { color: 'text-amber-600', bg: 'bg-amber-600', border: 'border-amber-200' },
  Other: { color: 'text-slate-600', bg: 'bg-slate-500', border: 'border-slate-200' },
};

export const TaskTypeBarChart: React.FC<TaskTypeBarChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxHours = Math.max(...data.map((d) => d.hours), 1);
  const totalHours = data.reduce((acc, d) => acc + d.hours, 0) || 1;

  return (
    <div className="space-y-3.5">
      {data.map((item, idx) => {
        const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.Other;
        const widthPct = (item.hours / maxHours) * 100;
        const totalPct = Math.round((item.hours / totalHours) * 100);

        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>{item.type}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{item.hours} hrs</span>
                <span className="text-[11px] text-slate-400">({totalPct}%)</span>
              </div>
            </div>

            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
              <div
                style={{ width: `${Math.max(widthPct, 3)}%` }}
                className={`h-full rounded-full ${config.bg} transition-all duration-500 shadow-sm`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
