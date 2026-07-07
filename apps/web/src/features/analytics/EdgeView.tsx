import React from "react";
import { Activity, Zap, TrendingUp, Search, Target, Clock, Calendar, BarChart3, ChevronRight } from "lucide-react";

export const EdgeView = ({ data, edgeFinder, formatMetric }: any) => {
  return (
    <div className="space-y-10 animate-in text-main max-w-[1400px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-amber" size={16} />
            <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Intelligence Layer™</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Opportunities Explorer</h1>
          <p className="text-muted text-sm font-medium mt-1">High-probability setup discovery through cross-regime data analysis.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
           <Search size={14} className="text-amber" />
           <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Scanning Database v2.1</span>
        </div>
      </header>

      {data.backtestTrades.length ? (
        <>
          <section className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {edgeFinder.findings.map((f: any, idx: number) => {
              const isPositive = f.status === 'positive';
              const isDanger = f.status === 'danger';

              return (
                <div key={idx} className="panel p-6 hover:translate-y-[-4px] transition-all group">
                   <span className="text-[10px] font-black text-muted uppercase tracking-widest block mb-4">{f.label}</span>
                   <div className="flex items-end justify-between">
                      <div className={`text-2xl font-black tracking-tight ${
                        isPositive ? 'text-mint-bright' : isDanger ? 'text-danger' : 'text-amber'
                      }`}>
                        {f.value}
                      </div>
                      <div className="text-[10px] font-bold text-dim group-hover:text-main transition-colors">
                        {f.detail}
                      </div>
                   </div>
                   <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full opacity-50 ${
                        isPositive ? 'bg-mint-bright' : isDanger ? 'bg-danger' : 'bg-amber'
                      }`} style={{ width: '60%' }}></div>
                   </div>
                </div>
              );
            })}
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            <article className="panel flex flex-col h-[500px]">
              <div className="panel-heading mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p>Temporal Edge</p>
                    <h2>Session Performance Matrix</h2>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                <div className="grid gap-3">
                   <div className="grid grid-cols-2 px-6 text-[9px] font-black text-muted uppercase tracking-widest mb-2">
                      <span>Operational Session</span>
                      <span className="text-right">Synthesized Net P/L</span>
                   </div>
                   {edgeFinder.sessions.map((r:any, idx: number) => (
                     <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="flex items-center gap-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-amber shadow-[0_0_8px_rgba(245,186,69,0.4)]"></div>
                           <span className="text-xs font-black text-main uppercase tracking-widest">{r.label}</span>
                        </div>
                        <div className={`text-lg font-black tracking-tighter ${r.netProfit >= 0 ? 'text-mint-bright' : 'text-danger'}`}>
                           {r.netProfit >= 0 ? '+' : ''}{formatMetric(r.netProfit)}
                        </div>
                     </div>
                   ))}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-line">
                 <button className="w-full py-2 text-[9px] font-black text-muted uppercase tracking-[0.2em] hover:text-amber transition flex items-center justify-center gap-2">
                    Open Session Details <ChevronRight size={12} />
                 </button>
              </div>
            </article>

            <article className="panel flex flex-col h-[500px]">
              <div className="panel-heading mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p>Cyclical Edge</p>
                    <h2>Weekday Probability Distribution</h2>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                <div className="grid gap-3">
                   <div className="grid grid-cols-2 px-6 text-[9px] font-black text-muted uppercase tracking-widest mb-2">
                      <span>Calendar Day</span>
                      <span className="text-right">Synthesized Net P/L</span>
                   </div>
                   {edgeFinder.weekdays.map((r:any, idx: number) => (idx < 5) && (
                     <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="flex items-center gap-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo shadow-[0_0_8px_rgba(99,102,241,0.4)]"></div>
                           <span className="text-xs font-black text-main uppercase tracking-widest">{r.label}</span>
                        </div>
                        <div className={`text-lg font-black tracking-tighter ${r.netProfit >= 0 ? 'text-mint-bright' : 'text-danger'}`}>
                           {r.netProfit >= 0 ? '+' : ''}{formatMetric(r.netProfit)}
                        </div>
                     </div>
                   ))}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-line">
                 <button className="w-full py-2 text-[9px] font-black text-muted uppercase tracking-[0.2em] hover:text-indigo transition flex items-center justify-center gap-2">
                    Open Weekday Analysis <ChevronRight size={12} />
                 </button>
              </div>
            </article>
          </div>
        </>
      ) : (
        <div className="panel py-40 text-center space-y-8 bg-[radial-gradient(circle_at_center,rgba(245,186,69,0.02),transparent_70%)] border-dashed border-white/5 rounded-[32px]">
           <div className="w-24 h-24 bg-white/5 border border-white/5 rounded-full flex items-center justify-center mx-auto text-muted shadow-2xl">
             <Target size={40} strokeWidth={1} />
           </div>
           <div className="space-y-3">
             <h2 className="text-2xl font-black tracking-tight text-main">Edge Data Unavailable</h2>
             <p className="text-muted max-w-sm mx-auto mb-8 font-medium">Insufficient execution logs found for probabilistic modeling. Execute simulation to initialize edge discovery.</p>
             <button className="primary-button px-10 rounded-2xl h-14 text-base bg-amber hover:bg-amber/90 shadow-[0_0_30px_rgba(245,186,69,0.2)]">
                Execute Research Simulation
             </button>
           </div>
        </div>
      )}
    </div>
  );
};
