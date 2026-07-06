import React from "react";
import { Bot, Zap, ShieldCheck, Target } from "lucide-react";
import type { AiReport } from "../../lib/types";

export const AIReviewPanel = ({ reports }: { reports: AiReport[] }) => {
  if (!reports.length) return (
    <div className="panel p-12 text-center space-y-4 bg-panel/50">
      <Bot size={40} className="mx-auto text-slate-600" />
      <h3 className="text-xl font-bold">Intelligence Empty</h3>
      <p className="text-slate-500 max-w-xs mx-auto text-sm">Generate your first AI review from the backtester or live journal to initialize persistent intelligence.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {reports.map((report) => (
        <article key={report.id} className="panel p-8 border-line hover:border-mint transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-mint/10 rounded-xl flex items-center justify-center text-mint"><Bot size={20} /></div>
              <div>
                <h3 className="text-lg font-bold capitalize">{report.report_type} Review</h3>
                <p className="text-xs text-slate-500">{new Date(report.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {Object.entries(report.scores).map(([label, score]) => (
                <div key={label} className="bg-ink border border-line px-3 py-1 rounded-lg">
                   <span className="text-[9px] uppercase font-bold text-slate-500 block">{label}</span>
                   <span className="text-xs font-black text-mint">{score}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed italic mb-8">"{report.summary}"</p>

          <div className="grid md:grid-cols-3 gap-6">
             <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-mint tracking-widest"><Zap size={12}/> Strengths</h4>
                <ul className="space-y-2">
                   {report.findings.filter(f => f.severity === 'positive').map((f, i) => (
                      <li key={i} className="text-xs text-slate-400 leading-tight">• {f.detail}</li>
                   ))}
                </ul>
             </div>
             <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-red-400 tracking-widest"><ShieldCheck size={12}/> Weaknesses</h4>
                <ul className="space-y-2">
                   {report.findings.filter(f => f.severity === 'warning').map((f, i) => (
                      <li key={i} className="text-xs text-slate-400 leading-tight">• {f.detail}</li>
                   ))}
                </ul>
             </div>
             <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 tracking-widest"><Target size={12}/> Recommendations</h4>
                <ul className="space-y-2">
                   {report.findings.filter(f => f.severity === 'neutral').map((f, i) => (
                      <li key={i} className="text-xs text-slate-400 leading-tight">• {f.detail}</li>
                   ))}
                </ul>
             </div>
          </div>
        </article>
      ))}
    </div>
  );
};
