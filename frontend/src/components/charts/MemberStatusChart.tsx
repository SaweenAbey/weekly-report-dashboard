import React from 'react';

interface MemberStatusChartProps {
  data: {
    memberName: string;
    email: string;
    department: string;
    submitted: number;
    approved: number;
    needsCorrection: number;
    draft: number;
    totalHours: number;
  }[];
}

export const MemberStatusChart: React.FC<MemberStatusChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Approved
          </span>
          <span className="flex items-center gap-1 text-blue-700">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            Submitted
          </span>
          <span className="flex items-center gap-1 text-amber-700">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Needs Correction
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            Draft
          </span>
        </div>
        <span className="text-[11px] text-slate-400">{data.length} Members Tracked</span>
      </div>

      <div className="space-y-3">
        {data.slice(0, 6).map((member, idx) => {
          const total =
            member.approved + member.submitted + member.needsCorrection + member.draft || 1;
          const approvedPct = (member.approved / total) * 100;
          const submittedPct = (member.submitted / total) * 100;
          const needsCorrPct = (member.needsCorrection / total) * 100;
          const draftPct = (member.draft / total) * 100;

          return (
            <div key={idx} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="truncate max-w-[180px]">{member.memberName}</span>
                <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">
                  {member.totalHours} hrs logged
                </span>
              </div>

              {/* Progress Stack */}
              <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
                {approvedPct > 0 && (
                  <div
                    style={{ width: `${approvedPct}%` }}
                    className="bg-emerald-500 h-full transition-all"
                    title={`Approved: ${member.approved}`}
                  />
                )}
                {submittedPct > 0 && (
                  <div
                    style={{ width: `${submittedPct}%` }}
                    className="bg-blue-500 h-full transition-all"
                    title={`Submitted: ${member.submitted}`}
                  />
                )}
                {needsCorrPct > 0 && (
                  <div
                    style={{ width: `${needsCorrPct}%` }}
                    className="bg-amber-500 h-full transition-all"
                    title={`Needs Correction: ${member.needsCorrection}`}
                  />
                )}
                {draftPct > 0 && (
                  <div
                    style={{ width: `${draftPct}%` }}
                    className="bg-slate-300 h-full transition-all"
                    title={`Draft: ${member.draft}`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
