import React, { useState } from "react";
import { FolderKanban, Star, MoreVertical, Plus, Search, Filter, History } from "lucide-react";
import { ScoreBadge } from "../../components/ui/Metrics";

export const ResearchLibrary = ({ data, onSelectProject, onNavigate }: any) => {
  const [filter, setFilter] = useState("all");
  const filteredProjects = (data.researchProjects || []).filter((p:any) => filter === 'all' || p.status === filter);

  return (
    <div className="space-y-8 animate-in max-w-[1400px] mx-auto">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FolderKanban className="text-mint" size={16} />
              <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Research Library</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Projects & Studies</h1>
            <p className="text-muted text-sm font-medium mt-1">Institutional archive of strategy simulations and quantitative research.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                <input
                  className="bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:border-mint/50 transition-all w-64"
                  placeholder="Filter projects..."
                />
             </div>
             <button onClick={() => onNavigate("backtests")} className="primary-button">
                <Plus size={16} className="mr-1" /> New Project
             </button>
          </div>
       </div>

       <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex gap-2">
             {['all', 'live_ready', 'approved'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f
                      ? 'bg-white/10 text-main shadow-lg border border-white/10'
                      : 'text-muted hover:text-main hover:bg-white/5'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
             ))}
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black text-muted uppercase tracking-widest">
             <span className="flex items-center gap-2"><Filter size={12} /> View Options</span>
             <span className="flex items-center gap-2"><History size={12} /> Sort: Recent</span>
          </div>
       </div>

       <div className="grid gap-4">
          {filteredProjects.length ? filteredProjects.map((p:any) => (
            <article
              key={p.id}
              onClick={() => onSelectProject(p)}
              className="panel p-6 hover:border-mint-bright/30 transition-all cursor-pointer group flex items-center justify-between"
            >
               <div className="flex items-center gap-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                    p.status === 'live_ready'
                      ? 'bg-mint-bright/10 border-mint-bright/30 text-mint-bright'
                      : 'bg-white/5 border-white/5 text-muted group-hover:text-main group-hover:bg-white/10'
                  }`}>
                    <FolderKanban size={28} strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black tracking-tight text-main group-hover:text-mint-bright transition-colors">{p.name}</h3>
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${
                          p.status === 'live_ready'
                            ? 'bg-mint-bright/10 border-mint-bright/20 text-mint-bright'
                            : 'bg-white/5 border-white/10 text-muted'
                        }`}>
                          {p.status.replace('_', ' ')}
                        </span>
                     </div>
                     <div className="flex items-center gap-4 text-xs font-bold text-muted">
                        <span className="flex items-center gap-1.5"><Target size={12} /> {p.market_symbol}</span>
                        <span className="text-white/10">|</span>
                        <span>{p.timeframe}</span>
                        <span className="text-white/10">|</span>
                        <span>v{p.version}</span>
                        <span className="text-white/10">|</span>
                        <span>{new Date(p.created_at).toLocaleDateString()}</span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-12">
                  <div className="flex gap-8">
                    <ScoreBadge label="Statistical Edge" score={p.research_score} />
                    <ScoreBadge label="Live Readiness" score={p.readiness_score} />
                  </div>
                  <div className="flex items-center gap-3 pl-8 border-l border-line">
                     <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                       <Star size={18} className="text-muted hover:text-amber transition-colors" />
                     </button>
                     <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                       <MoreVertical size={18} className="text-muted" />
                     </button>
                  </div>
               </div>
            </article>
          )) : (
            <div className="panel py-40 text-center space-y-8 bg-[radial-gradient(circle_at_center,rgba(53,208,163,0.03),transparent_70%)] border-dashed border-white/5 rounded-[32px]">
               <div className="w-24 h-24 bg-white/5 border border-white/5 rounded-full flex items-center justify-center mx-auto text-muted shadow-2xl">
                 <FolderKanban size={40} strokeWidth={1} />
               </div>
               <div className="space-y-3">
                 <h2 className="text-2xl font-black tracking-tight text-main">Zero Research Records Found</h2>
                 <p className="text-muted max-w-sm mx-auto mb-8 font-medium">Your institutional archive is empty. Begin by launching a strategy simulation in the Backtesting Lab.</p>
                 <button onClick={() => onNavigate("backtests")} className="primary-button px-10 rounded-2xl h-14 text-base">
                    Initialize First Simulation
                 </button>
               </div>
            </div>
          )}
       </div>
    </div>
  );
};

const Target = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
