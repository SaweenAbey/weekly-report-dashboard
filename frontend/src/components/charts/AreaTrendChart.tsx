import React from 'react';

interface AreaTrendChartProps {
  data: {
    week: string;
    completed: number;
    inProgress: number;
  }[];
}

export const AreaTrendChart: React.FC<AreaTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => Math.max(d.completed, d.inProgress, 5)));
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * (width - paddingX * 2);
    const yCompleted = height - paddingY - (d.completed / maxVal) * (height - paddingY * 2);
    const yInProgress = height - paddingY - (d.inProgress / maxVal) * (height - paddingY * 2);
    return { x, yCompleted, yInProgress, ...d };
  });

  const completedPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yCompleted}`)
    .join(' ');

  const completedArea = `${completedPath} L ${points[points.length - 1].x} ${
    height - paddingY
  } L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-emerald-700">
            <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
            Tasks Completed
          </span>
          <span className="flex items-center gap-1.5 font-bold text-blue-700">
            <span className="h-3 w-3 rounded-full bg-blue-500 shadow-sm" />
            In Progress
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">4-Week Velocity</span>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-900 p-4 text-white shadow-inner">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const y = height - paddingY - ratio * (height - paddingY * 2);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#334155"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Area */}
          <path d={completedArea} fill="url(#completedGrad)" />

          {/* Completed Curve */}
          <path
            d={completedPath}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.yCompleted}
                r="5"
                fill="#10b981"
                stroke="#0f172a"
                strokeWidth="2.5"
                className="hover:r-7 transition-all cursor-pointer"
              />
              <text
                x={p.x}
                y={p.yCompleted - 10}
                textAnchor="middle"
                className="text-[10px] font-bold fill-emerald-400 select-none"
              >
                {p.completed}
              </text>
              <text
                x={p.x}
                y={height - 4}
                textAnchor="middle"
                className="text-[10px] font-medium fill-slate-400 select-none"
              >
                {p.week}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
