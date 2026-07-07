import React from "react";
import { BookOpen, Plus, Target, Clock, Zap, Brain, MessageSquare, ChevronRight, Activity, Smile, Frown, Meh, AlertCircle } from "lucide-react";

export const JournalView = ({ data, selectedTrade, setSelectedTradeId, journalEmotion, setJournalEmotion, journalMistakes, setJournalMistakes, journalNotes, setJournalNotes, onSubmit, activeProject, formatMetric }: any) => {
  return (
    <div className="space-y-10 animate-in text-main max-w-[1500px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-indigo" size={16} />
            <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Institutional Journey</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Trading Journal</h1>
          <p className="text-muted text-sm font-medium mt-1">Refine your cognitive edge through systematic behavioral documentation.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
           <Activity size={14} className="text-indigo" />
           <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Discipline Guardian™ Active</span>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-12">
        {/* Left Side: Trade Ledger */}
        <article className="panel lg:col-span-7 flex flex-col h-[750px]">
          <div className="panel-heading mb-6">
            <div>
              <p>Execution Log</p>
              <h2>Session History</h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
               Total: {data.backtestTrades.length} Trades
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
            <div className="grid gap-3">
              <div className="grid grid-cols-12 px-6 text-[9px] font-black text-muted uppercase tracking-widest mb-2">
                 <span className="col-span-1">ID</span>
                 <span className="col-span-2">Execution</span>
                 <span className="col-span-3">Timestamp</span>
                 <span className="col-span-2">Side</span>
                 <span className="col-span-2 text-right">R-Multi</span>
                 <span className="col-span-2 text-right">Net P/L</span>
              </div>

              {data.backtestTrades.length ? data.backtestTrades.map((t: any) => {
                const isSelected = selectedTrade?.id === t.id;
                const isProfit = Number(t.payload.pnl) >= 0;

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTradeId(t.id)}
                    className={`grid grid-cols-12 items-center px-6 py-4 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? "bg-indigo/5 border-indigo/40 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                        : "bg-white/5 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <span className="col-span-1 text-xs font-black text-muted">#{t.trade_index}</span>
                    <div className="col-span-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-main">EURUSD</span>
                    </div>
                    <div className="col-span-3">
                       <span className="text-[10px] font-bold text-muted">{new Date(t.payload.entry_time).toLocaleDateString()}</span>
                    </div>
                    <div className="col-span-2">
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                         t.payload.side === 'long' ? 'bg-mint-bright/10 border-mint-bright/20 text-mint-bright' : 'bg-danger/10 border-danger/20 text-danger'
                       }`}>
                         {t.payload.side}
                       </span>
                    </div>
                    <div className="col-span-2 text-right">
                       <span className="text-xs font-black text-dim">{t.payload.r_multiple.toFixed(1)}R</span>
                    </div>
                    <div className="col-span-2 text-right">
                       <span className={`text-sm font-black tracking-tight ${isProfit ? "text-mint-bright" : "text-danger"}`}>
                         {isProfit ? '+' : ''}{formatMetric(t.payload.pnl)}
                       </span>
                    </div>
                  </button>
                );
              }) : (
                <div className="py-40 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-muted">
                    <Target size={30} strokeWidth={1} />
                  </div>
                  <p className="text-muted font-medium italic">Execute a simulation to generate trade logs.</p>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Right Side: Journal Entry */}
        <article className="panel lg:col-span-5 flex flex-col h-[750px]">
          <div className="panel-heading mb-8">
            <div>
              <p>Qualitative Data</p>
              <h2>Behavioral Entry</h2>
            </div>
            <Brain className="text-indigo" size={24} />
          </div>

          {selectedTrade ? (
            <div className="flex-1 flex flex-col min-h-0">
               <div className="bg-indigo/5 border border-indigo/20 rounded-2xl p-6 mb-8 flex justify-between items-center group">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo/10 flex items-center justify-center text-indigo">
                       <Zap size={24} />
                    </div>
                    <div>
                       <span className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1">Editing Record</span>
                       <h3 className="text-lg font-black text-main tracking-tight">Trade #{selectedTrade.trade_index}</h3>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className={`block text-xl font-black ${Number(selectedTrade.payload.pnl) >= 0 ? "text-mint-bright" : "text-danger"}`}>
                       {formatMetric(selectedTrade.payload.pnl)}
                    </span>
                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Post-Execution P/L</span>
                 </div>
               </div>

               {activeProject && (
                 <div className="px-5 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-muted uppercase tracking-widest mb-8 flex items-center gap-3">
                    <Activity size={12} className="text-mint" />
                    Project Link: <span className="text-main">{activeProject.name} (v{activeProject.version})</span>
                 </div>
               )}

               <form className="flex-1 flex flex-col tool-form overflow-y-auto custom-scrollbar pr-2 -mr-2" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
                 <div className="grid gap-6">
                    <div className="space-y-4">
                       <label className="block">
                          <span className="flex items-center gap-2">
                             <Smile size={14} className="text-indigo" /> Psychological State
                          </span>
                          <div className="grid grid-cols-3 gap-2 mt-3">
                             {['Focused', 'Calm', 'Fearful'].map(e => (
                               <button
                                 key={e}
                                 type="button"
                                 onClick={() => setJournalEmotion(e)}
                                 className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                   journalEmotion === e
                                     ? "bg-indigo/10 border-indigo/40 text-indigo shadow-inner"
                                     : "bg-white/5 border-white/5 text-muted hover:border-white/20"
                                 }`}
                               >
                                 {e}
                               </button>
                             ))}
                          </div>
                       </label>
                    </div>

                    <label className="block">
                       <span className="flex items-center gap-2">
                          <AlertCircle size={14} className="text-amber" /> Behavioral Errors
                       </span>
                       <input
                         value={journalMistakes}
                         onChange={e => setJournalMistakes(e.target.value)}
                         placeholder="e.g. FOMO, Premature Exit, Size Error"
                         className="mt-3 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo transition-all"
                       />
                    </label>

                    <label className="block flex-1">
                       <span className="flex items-center gap-2">
                          <MessageSquare size={14} className="text-indigo" /> Post-Trade Analysis
                       </span>
                       <textarea
                         value={journalNotes}
                         onChange={e => setJournalNotes(e.target.value)}
                         placeholder="Document market context, execution precision, and psychological observations..."
                         className="mt-3 w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm min-h-[180px] focus:border-indigo transition-all leading-relaxed"
                       />
                    </label>
                 </div>

                 <div className="mt-8 pt-8 border-t border-line">
                   <button className="primary-button !h-14 w-full rounded-2xl text-base shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-indigo hover:bg-indigo/90" type="submit">
                     Synchronize Journal Entry <ChevronRight size={18} className="ml-2" />
                   </button>
                 </div>
               </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
               <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-muted border border-white/5">
                  <MessageSquare size={32} strokeWidth={1.5} />
               </div>
               <div>
                  <h3 className="text-xl font-black tracking-tight text-main mb-2">Record Pending Selection</h3>
                  <p className="text-muted text-sm max-w-[240px] mx-auto">Select a trade from the session history to begin qualitative documentation.</p>
               </div>
            </div>
          )}
        </article>
      </section>
    </div>
  );
};
