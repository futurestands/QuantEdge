import React, { useState } from "react";
import { FolderKanban, Star, MoreVertical } from "lucide-react";
import { ScoreBadge } from "../../components/ui/Metrics";

export const ResearchLibrary = ({ data, onSelectProject, onNavigate }: any) => {
  const [filter, setFilter] = useState("all");
  const filteredProjects = (data.researchProjects || []).filter((p:any) => filter === 'all' || p.status === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
       <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Research</h1>
            <p className="text-slate-400 mt-1">Projects, studies and trading ideas. <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest ml-2">Intelligence Layer™</span></p>
          </div>
          <div className="flex gap-3">
             <div className="flex p-1 bg-panel rounded-xl border border-line">
                {['all', 'live_ready', 'approved'].map(f => (
                   <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-ink text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{f.replace('_', ' ').toUpperCase()}</button>
                ))}
             </div>
          </div>
       </div>

       <div className="grid gap-4">
          {filteredProjects.length ? filteredProjects.map((p:any) => (
            <article key={p.id} onClick={() => onSelectProject(p)} className="panel p-6 bg-gradient-to-r from-[#10141d] to-[#0b0f16] border-line hover:border-mint transition-all cursor-pointer group">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${p.status === 'live_ready' ? 'bg-mint/10 border-mint text-mint' : 'bg-panel border-line text-slate-500 group-hover:text-mint group-hover:border-mint/30'}`}><FolderKanban size={20} /></div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-3"><h3 className="text-lg font-bold">{p.name}</h3><span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${p.status === 'live_ready' ? 'border-mint text-mint' : 'border-line text-slate-500'}`}>{p.status.replace('_', ' ')}</span></div>
                        <p className="text-xs text-slate-500">{p.market_symbol} • {p.timeframe} • v{p.version} • {new Date(p.created_at).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-10">
                     <ScoreBadge label="Research" score={p.research_score} />
                     <ScoreBadge label="Readiness" score={p.readiness_score} />
                     <div className="flex items-center gap-1"><Star size={14} className="text-slate-600 hover:text-yellow-500 transition-colors" /><button className="icon-button h-8 w-8"><MoreVertical size={14}/></button></div>
                  </div>
               </div>
            </article>
          )) : (
            <div className="panel py-40 text-center space-y-6 bg-mint/5 border-dashed border-mint/20 rounded-3xl">
               <div className="w-20 h-20 bg-panel border border-line rounded-full flex items-center justify-center mx-auto text-slate-500"><FolderKanban size={32} /></div>
               <div className="space-y-2">
                 <h2 className="text-xl font-bold">You haven't created any research yet.</h2>
                 <p className="text-slate-500 max-w-xs mx-auto mb-6">Launch your first simulation to initialize the research workflow.</p>
                 <button onClick={() => onNavigate("backtests")} className="primary-button">Create Research</button>
               </div>
            </div>
          )}
       </div>
    </div>
  );
};
