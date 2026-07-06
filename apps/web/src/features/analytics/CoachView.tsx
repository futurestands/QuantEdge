import React from "react";
import { Bot } from "lucide-react";

export const CoachView = ({ data, handleGenerateCoachReport }: any) => (
  <article className="panel animate-in fade-in duration-500">
    <div className="panel-heading">
      <div>
        <p>AI Coach</p>
        <h2>Personal Performance Mentor</h2>
      </div>
      <div className="text-right">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Intelligence Layer™</p>
      </div>
      <Bot size={21} className="text-mint" />
    </div>
    <p className="text-xs text-slate-400 mb-6 -mt-2">Personal trading mentor providing data-driven insights and behavioral adjustments.</p>
    <div className="space-y-6">
      <div className="p-8 rounded-2xl bg-panel border border-line leading-relaxed text-slate-300">{data.aiSummary || "Run research to initialize the cognitive engine."}</div>
      <div className="grid grid-cols-3 gap-6">{data.scores.map(([l, s]: any) => (<div key={l} className="panel text-center"><span className="text-[10px] uppercase text-slate-500">{l}</span><div className="text-4xl font-bold text-mint mt-2">{s}</div></div>))}</div>
      <button onClick={handleGenerateCoachReport} className="primary-button full-button h-14 text-lg"><Bot size={20} /> Generate New Report</button>
    </div>
  </article>
);
