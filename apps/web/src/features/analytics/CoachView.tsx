import React from "react";
import { Bot, Lightbulb, Target, Activity, ShieldCheck, ChevronRight, Brain, Sparkles, MessageSquare } from "lucide-react";

export const CoachView = ({ data, handleGenerateCoachReport }: any) => {
  return (
    <div className="space-y-10 animate-in text-main max-w-[1200px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bot className="text-indigo" size={16} />
            <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Intelligence Layer™</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">AI Performance Coach</h1>
          <p className="text-muted text-sm font-medium mt-1">Cognitive behavioral adjustments and probabilistic strategy feedback.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
           <Brain size={14} className="text-indigo" />
           <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Neural Engine v4.0</span>
        </div>
      </header>

      <div className="grid gap-8">
        <article className="panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo/5 blur-[100px] rounded-full group-hover:bg-indigo/10 transition-all duration-1000"></div>
          <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-mint/5 blur-[80px] rounded-full group-hover:bg-mint/10 transition-all duration-1000"></div>

          <div className="relative p-10 flex flex-col md:flex-row gap-12 items-start">
             <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-indigo to-indigo-600 flex items-center justify-center shadow-[0_10px_30px_rgba(99,102,241,0.3)] shrink-0 border border-white/20">
                <MessageSquare size={40} className="text-white fill-white/10" />
             </div>

             <div className="flex-1 space-y-8">
                <div className="space-y-2">
                   <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Latest Operational Insight</span>
                   <p className="text-2xl font-black text-main leading-snug italic tracking-tight">
                     "{data.aiSummary || "Simulation required to initialize the neural performance engine. QuantEdge AI synthesizes your execution history to provide institutional-grade feedback."}"
                   </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                   {data.scores.map(([l, s]: any, idx: number) => {
                     const Icon = idx === 0 ? Activity : idx === 1 ? Target : ShieldCheck;
                     return (
                       <div key={l} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo/30 transition-all group/card">
                          <div className="flex items-center justify-between mb-4">
                             <Icon size={18} className="text-indigo group-hover/card:scale-110 transition-transform" />
                             <span className="text-[9px] font-black text-muted uppercase tracking-widest">{l}</span>
                          </div>
                          <div className="flex items-end gap-2">
                             <div className="text-4xl font-black text-main tabular-nums">{s}</div>
                             <div className="text-xs font-black text-muted mb-1.5 uppercase tracking-widest">/100</div>
                          </div>
                          <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400" style={{ width: `${s}%` }}></div>
                          </div>
                       </div>
                     );
                   })}
                </div>

                <div className="pt-6 border-t border-line flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-center gap-6">
                      <div className="flex -space-x-3">
                         {Array.from({ length: 4 }).map((_, i) => (
                           <div key={i} className="w-8 h-8 rounded-full bg-white/5 border border-ink flex items-center justify-center overflow-hidden">
                              <div className="w-full h-full bg-gradient-to-br from-indigo/20 to-mint/20 animate-pulse"></div>
                           </div>
                         ))}
                      </div>
                      <span className="text-[10px] font-black text-muted uppercase tracking-widest">Processing 42 Execution Data Points</span>
                   </div>

                   <button
                     onClick={handleGenerateCoachReport}
                     className="primary-button !h-14 px-10 rounded-2xl bg-indigo hover:bg-indigo-600 shadow-[0_0_30px_rgba(99,102,241,0.2)] text-base group"
                   >
                     Initialize Full Performance Review <Sparkles size={18} className="ml-3 group-hover:rotate-12 transition-transform" />
                   </button>
                </div>
             </div>
          </div>
        </article>

        <div className="grid md:grid-cols-2 gap-8">
           <article className="panel p-8">
              <div className="panel-heading mb-6">
                 <div>
                    <p>Methodology</p>
                    <h2>Cognitive Model</h2>
                 </div>
                 <Lightbulb className="text-amber" size={20} />
              </div>
              <p className="text-sm text-dim leading-relaxed font-medium">
                 QuantEdge uses a proprietary transformer-based architecture to identify latent patterns in your trade logs. It correlates psychological states with execution precision to identify your true institutional edge.
              </p>
           </article>

           <article className="panel p-8">
              <div className="panel-heading mb-6">
                 <div>
                    <p>Safety Protocol</p>
                    <h2>Discipline Guardian</h2>
                 </div>
                 <ShieldCheck className="text-mint-bright" size={20} />
              </div>
              <p className="text-sm text-dim leading-relaxed font-medium">
                 Your AI Coach is integrated with the Execution Firewall. Continuous negative behavioral patterns will trigger automated restrictions to preserve institutional capital and psychological stability.
              </p>
           </article>
        </div>
      </div>
    </div>
  );
};
