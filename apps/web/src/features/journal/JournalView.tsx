import React from "react";
import { BookOpen, Plus } from "lucide-react";

export const JournalView = ({ data, selectedTrade, setSelectedTradeId, journalEmotion, setJournalEmotion, journalMistakes, setJournalMistakes, journalNotes, setJournalNotes, onSubmit, activeProject, formatMetric }: any) => (
  <div className="space-y-6 animate-in fade-in duration-500 text-main">
    <header>
      <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
      <p className="text-muted mt-1">Track your trades and improve discipline. <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest ml-2">Powered by Discipline Guardian™</span></p>
    </header>
    <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <article className="panel">
        <div className="panel-heading"><div><p>Log</p><h2>Trade History</h2></div><BookOpen size={21} /></div>
        <div className="trade-table">{data.backtestTrades.length ? data.backtestTrades.map((t: any) => (<button key={t.id} onClick={() => setSelectedTradeId(t.id)} className={`trade-row ${selectedTrade?.id === t.id ? "selected" : ""}`}><span className="text-main">#{t.trade_index}</span><span className="text-muted">{t.payload.side}</span><span className={Number(t.payload.pnl) >= 0 ? "profit" : "loss"}>{formatMetric(t.payload.pnl)}</span></button>)) : <div className="empty-state py-20 text-center text-muted">No trades recorded.</div>}</div>
      </article>
      <article className="panel">
        <div className="panel-heading"><div><p>Journal</p><h2>New Entry</h2></div><Plus size={21} /></div>
        {selectedTrade ? (
          <form className="tool-form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            <div className="review-summary"><strong className="text-main">Trade #{selectedTrade.trade_index}</strong><span className="text-dim">{formatMetric(selectedTrade.payload.pnl)}</span></div>
            {activeProject && <div className="p-3 bg-panel rounded-lg border border-line text-[10px] text-muted">Linked Project: {activeProject.name} (v{activeProject.version})</div>}
            <label><span>Emotion</span><select value={journalEmotion} onChange={e => setJournalEmotion(e.target.value)}><option>Focused</option><option>Calm</option><option>Fearful</option></select></label>
            <label><span>Mistakes</span><input value={journalMistakes} onChange={e => setJournalMistakes(e.target.value)} placeholder="e.g. FOMO, Over-leveraged" /></label>
            <label><span>Notes</span><textarea value={journalNotes} onChange={e => setJournalNotes(e.target.value)} placeholder="What worked? What failed? Would you trade this live?" className="min-h-[200px]" /></label>
            <button className="primary-button" type="submit">Save Entry</button>
          </form>
        ) : <div className="empty-state py-20 text-center text-muted">Select a trade to journal.</div>}
      </article>
    </section>
  </div>
);
