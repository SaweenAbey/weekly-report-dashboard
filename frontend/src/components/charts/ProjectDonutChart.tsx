import React from 'react';

interface ProjectDonutChartProps {
  data: {
    name: string;
    key: string;
    reportsCount: number;
    hoursLogged: number;
  }[];
}

const COLORS = [
  { bg: 'bg-indigo-500', hex: '#6366f1', text: 'text-indigo-600' },
  { bg: 'bg-violet-500', hex: '#8b5cf6', text: 'text-violet-600' },
  { bg: 'bg-cyan-500', hex: '#06b6d4', text: 'text-cyan-600' },
  { bg: 'bg-emerald-500', hex: '#10b981', text: 'text-emerald-600' },
  { bg: 'bg-amber-500', hex: '#f59e0b', text: 'text-amber-600' },
];

export const ProjectDonutChart: React.FC<ProjectDonutChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const totalHours = data.reduce((acc, p) => acc + (p.hoursLogged || 0), 0) || 1;

  // Compute SVG arc strokes
  let accumulatedAngle = 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const slices = data.map((p, idx) => {
    const hours = p.hoursLogged || 0;
    const percentage = hours / totalHours;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * circumference;
    accumulatedAngle += percentage;
    const color = COLORS[idx % COLORS.length];

    return {
      ...p,
      percentage: Math.round(percentage * 100),
      strokeDasharray,
      strokeDashoffset,
      color,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* SVG Donut */}
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-40 w-40 -rotate-90 transform">
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={slice.color.hex}
              strokeWidth="12"
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              className="transition-all duration-500 hover:opacity-85"
            />
          ))}
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black text-slate-900 leading-tight">
            {totalHours}h
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Work</span>
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="flex-1 space-y-2.5 w-full">
        {slices.map((slice, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${slice.color.bg}`} />
              <span className="font-bold text-slate-800 truncate max-w-[130px]">
                [{slice.key}] {slice.name}
              </span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-slate-500">{slice.hoursLogged}h</span>
              <span className={`font-bold ${slice.color.text}`}>
                {slice.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
