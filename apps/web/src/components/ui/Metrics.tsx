import React from "react";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Activity, Target, BarChart3, ShieldCheck } from "lucide-react";

export const MetricBox = ({ label, value, trend, detail, icon: Icon }: any) => (
  <article className="panel flex flex-col justify-between p-6 hover:translate-y-[-4px] transition-all duration-300 group overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] -rotate-12 translate-x-8 -translate-y-8 rounded-3xl group-hover:bg-white/[0.03] transition-all"></div>

    <div className="flex justify-between items-start mb-6 relative">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted mb-1">{label}</span>
        {Icon && <Icon className="text-muted/40 group-hover:text-main transition-colors" size={16} />}
      </div>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border ${
        trend === 'up' ? 'bg-mint-bright/10 border-mint-bright/20 text-mint-bright shadow-[0_0_10px_rgba(53,208,163,0.1)]' : 'bg-danger/10 border-danger/20 text-danger'
      }`}>
        {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {detail || "0%"}
      </div>
    </div>
    <div className="flex items-end justify-between gap-4 relative">
      <strong className="text-3xl font-black tracking-tighter leading-none text-main tabular-nums">{value}</strong>
      <div className="flex-1 max-w-[100px] h-8 opacity-20 group-hover:opacity-40 transition-opacity">
        <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d">
          <path
            d={trend === 'up' ? "M0 35 Q 25 30, 50 15 T 100 5" : "M0 5 Q 25 10, 50 25 T 100 35"}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className={trend === 'up' ? 'text-mint-bright' : 'text-danger'}
          />
        </svg>
      </div>
    </div>
  </article>
);

export const ScoreRow = ({ label, score, icon: Icon }: any) => (
  <div className="flex items-center gap-4 py-1 group/row">
    {Icon && (
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-muted group-hover/row:text-main group-hover/row:border-white/20 transition-all">
        <Icon size={18} strokeWidth={2.5} />
      </div>
    )}
    <div className="flex-1 space-y-2">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
        <span className="text-muted/80">{label}</span>
        <span className="text-mint">{score}/100</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-mint/40 via-mint to-mint-bright transition-all duration-1000 rounded-full shadow-glow"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  </div>
);

export const StatBadge = ({ label, value, color = "text-main" }: any) => (
  <div className="px-5 py-3 bg-white/5 border border-white/5 rounded-[18px] hover:bg-white/[0.08] transition-colors cursor-default">
    <span className="block text-[9px] uppercase tracking-widest text-muted font-black mb-1.5 italic opacity-60">{label}</span>
    <span className={`block text-sm font-black tracking-tight ${color}`}>{value}</span>
  </div>
);

export const ScoreBadge = ({ label, score }: any) => {
  const colorClass = score >= 80 ? 'text-mint-bright' : score >= 60 ? 'text-amber' : 'text-danger';
  const bgClass = score >= 80 ? 'bg-mint-bright/10' : score >= 60 ? 'bg-amber/10' : 'bg-danger/10';
  const borderClass = score >= 80 ? 'border-mint-bright/20' : score >= 60 ? 'border-amber/20' : 'border-danger/20';

  return (
    <div className="flex flex-col items-center gap-2 min-w-[90px] group/badge">
       <span className="text-[9px] uppercase font-black text-muted tracking-[0.2em] group-hover/badge:text-main transition-colors">{label}</span>
       <div className={`text-xl font-black ${colorClass} ${bgClass} px-4 py-1.5 rounded-xl border ${borderClass} shadow-inner transition-transform group-hover/badge:scale-110 duration-300`}>
         {score}
       </div>
    </div>
  );
};

export const StatItem = ({ label, value, color }: any) => (
  <div className="space-y-2 group/stat">
    <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-black block group-hover/stat:text-main transition-colors">{label}</span>
    <span className={`text-2xl font-black tracking-tighter tabular-nums ${color || "text-main"}`}>{value}</span>
  </div>
);

export const ScoreCard = ({ label, score, color, labelOverride }: any) => {
  const colorClass = color || (score >= 80 ? 'text-mint-bright' : score >= 60 ? 'text-amber' : 'text-danger');
  const bgClass = score >= 80 ? 'bg-mint-bright/5' : score >= 60 ? 'bg-amber/5' : 'bg-danger/5';
  const borderClass = score >= 80 ? 'border-mint-bright/10' : score >= 60 ? 'border-amber/10' : 'border-danger/10';

  return (
    <div className={`panel p-8 text-center space-y-5 ${bgClass} ${borderClass} hover:translate-y-[-5px] transition-all duration-300 group`}>
       <span className="text-[10px] uppercase font-black text-muted tracking-[0.2em] block italic">{label}</span>
       <div className={`text-5xl font-black tracking-tighter ${colorClass} group-hover:scale-110 transition-transform duration-500`}>{labelOverride || score}</div>
       <div className="h-2 bg-white/5 rounded-full overflow-hidden w-32 mx-auto border border-white/5 p-0.5">
         <div className={`h-full bg-current rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.2)]`} style={{ width: `${score}%` }} />
       </div>
    </div>
  );
};
