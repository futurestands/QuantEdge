import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export const MetricBox = ({ label, value, trend, detail }: any) => (
  <article className="metric-card group hover:border-mint transition-all duration-300 flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <span className="text-xs uppercase tracking-widest font-bold text-muted">{label}</span>
      {trend === 'up' ? <ArrowUpRight className="text-mint" size={16} /> : trend === 'down' ? <ArrowDownRight className="text-danger" size={16} /> : <div />}
    </div>
    <div className="mt-4">
      <strong className="text-3xl tracking-tight leading-none text-main">{value}</strong>
      {detail && <p className="text-[10px] text-muted mt-2 uppercase font-bold tracking-widest">{detail}</p>}
    </div>
  </article>
);

export const StatItem = ({ label, value, color }: any) => (
  <div className="space-y-2">
    <span className="text-[10px] uppercase tracking-widest text-muted font-bold block">{label}</span>
    <span className={`text-xl font-bold tracking-tight ${color || "text-main"}`}>{value}</span>
  </div>
);

export const ScoreRow = ({ label, score }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
      <span className="text-muted">{label}</span>
      <span className="text-mint">{score}/100</span>
    </div>
    <div className="h-2.5 bg-panel border border-line rounded-full overflow-hidden p-0.5">
      <div className="h-full bg-gradient-to-r from-mint/50 to-mint transition-all duration-1000 rounded-full" style={{ width: `${score}%` }} />
    </div>
  </div>
);

export const ScoreCard = ({ label, score, color, labelOverride }: any) => (
  <div className="panel p-6 bg-ink border-line/40 text-center space-y-3">
     <span className="text-[10px] uppercase font-bold text-muted tracking-widest block">{label}</span>
     <div className={`text-4xl font-bold ${color}`}>{labelOverride || score}</div>
     <div className="h-1.5 bg-panel rounded-full overflow-hidden w-24 mx-auto"><div className={`h-full bg-mint`} style={{ width: `${score}%` }} /></div>
  </div>
);

export const ScoreBadge = ({ label, score }: any) => (
  <div className="text-center w-20">
     <span className="text-[9px] uppercase font-bold text-muted block mb-1">{label}</span>
     <div className={`text-lg font-bold ${score > 80 ? 'text-mint' : score > 60 ? 'text-amber' : 'text-danger'}`}>{score}</div>
  </div>
);
