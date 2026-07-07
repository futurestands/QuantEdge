import React from "react";
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp, TrendingDown } from "lucide-react";

export const MetricBox = ({ label, value, trend, detail, icon: Icon }: any) => (
  <article className="panel flex flex-col justify-between p-6 hover:translate-y-[-4px] transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted mb-1">{label}</span>
        {Icon && <Icon className="text-muted/40" size={16} />}
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold ${
        trend === 'up' ? 'bg-mint-bright/10 text-mint-bright' : 'bg-danger/10 text-danger'
      }`}>
        {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {detail || "0%"}
      </div>
    </div>
    <div className="flex items-end justify-between gap-4">
      <strong className="text-2xl font-black tracking-tighter leading-none text-main">{value}</strong>
      <div className="flex-1 max-w-[80px] h-8 opacity-20 group-hover:opacity-40 transition-opacity">
        <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d">
          <path
            d={trend === 'up' ? "M0 30 Q 25 25, 50 15 T 100 5" : "M0 10 Q 25 15, 50 25 T 100 35"}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className={trend === 'up' ? 'text-mint-bright' : 'text-danger'}
          />
        </svg>
      </div>
    </div>
  </article>
);

export const ScoreRow = ({ label, score, icon: Icon }: any) => (
  <div className="flex items-center gap-4 py-1">
    {Icon && <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted"><Icon size={16} /></div>}
    <div className="flex-1 space-y-2">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
        <span className="text-muted">{label}</span>
        <span className="text-mint">{score}/100</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-mint/40 to-mint transition-all duration-1000 rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  </div>
);

export const StatBadge = ({ label, value, color = "text-main" }: any) => (
  <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
    <span className="block text-[9px] uppercase tracking-widest text-muted font-black mb-1">{label}</span>
    <span className={`block text-sm font-black ${color}`}>{value}</span>
  </div>
);

export const ScoreBadge = ({ label, score }: any) => {
  const colorClass = score >= 80 ? 'text-mint-bright' : score >= 60 ? 'text-amber' : 'text-danger';
  const bgClass = score >= 80 ? 'bg-mint-bright/10' : score >= 60 ? 'bg-amber/10' : 'bg-danger/10';

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
       <span className="text-[9px] uppercase font-black text-muted tracking-widest">{label}</span>
       <div className={`text-lg font-black ${colorClass} ${bgClass} px-3 py-1 rounded-lg border border-white/5 shadow-inner`}>
         {score}
       </div>
    </div>
  );
};

export const StatItem = ({ label, value, color }: any) => (
  <div className="space-y-2">
    <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-black block">{label}</span>
    <span className={`text-2xl font-black tracking-tight ${color || "text-main"}`}>{value}</span>
  </div>
);

export const ScoreCard = ({ label, score, color, labelOverride }: any) => {
  const colorClass = color || (score >= 80 ? 'text-mint-bright' : score >= 60 ? 'text-amber' : 'text-danger');
  return (
    <div className="panel p-8 text-center space-y-4 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
       <span className="text-[10px] uppercase font-black text-muted tracking-[0.2em] block">{label}</span>
       <div className={`text-5xl font-black tracking-tighter ${colorClass}`}>{labelOverride || score}</div>
       <div className="h-1.5 bg-white/5 rounded-full overflow-hidden w-32 mx-auto border border-white/5">
         <div className={`h-full bg-current opacity-60`} style={{ width: `${score}%` }} />
       </div>
    </div>
  );
};
