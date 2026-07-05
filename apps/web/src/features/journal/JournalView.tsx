import React from "react";
import { BookOpen, Plus } from "lucide-react";

export const JournalView = ({ data, selectedTrade, setSelectedTradeId, journalEmotion, setJournalEmotion, journalMistakes, setJournalMistakes, journalNotes, setJournalNotes, onSubmit, activeProject, formatMetric }: any) => (
  <section className="grid gap-6 xl:grid-cols-[1fr_1fr] animate-in fade-in duration-500">
    <article className="panel">
      <div className="panel-heading"><div><p>Review</p><h2>Trade Log</h2></div><BookOpen size={21} /></div>
      <div className="trade-table">{data.backtestTrades.length ? data.backtestTrades.map((t: any) => (<button key={t.id} onClick={() => setSelectedTradeId(t.id)} className={`trade-row ${selectedTrade?.id === t.id ? "selected" : ""}`}><span>#{t.trade_index}</span><span>{t.payload.side}</span><span className={Number(t.payload.pnl) >= 0 ? "profit" : "loss"}>{formatMetric(t.payload.pnl)}</span></button>)) : <div className="empty-state py-20 text-center">No trades recorded.</div>}</div>
    </article>
    <article className="panel">
      <div className="panel-heading"><div><p>Reflection</p><h2>Journal Entry</h2></div><Plus size={21} /></div>
      {selectedTrade ? (
        <form className="tool-form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="review-summary"><strong>Trade #{selectedTrade.trade_index}</strong><span>{formatMetric(selectedTrade.payload.pnl)}</span></div>
          {activeProject && <div className="p-3 bg-panel rounded-lg border border-line text-[10px] text-slate-400">Linked Project: {activeProject.name} (v{activeProject.version})</div>}
          <label><span>Emotion</span><select value={journalEmotion} onChange={e => setJournalEmotion(e.target.value)}><option>Focused</option><option>Calm</option><option>Fearful</option></select></label>
          <label><span>Mistakes</span><input value={journalMistakes} onChange={e => setJournalMistakes(e.target.value)} placeholder="e.g. FOMO, Over-leveraged" /></label>
          <label><span>Notes</span><textarea value={journalNotes} onChange={e => setJournalNotes(e.target.value)} placeholder="What worked? What failed? Would you trade this live?" className="min-h-[200px]" /></label>
          <button className="primary-button" type="submit">Save Entry</button>
        </form>
      ) : <div className="empty-state">Select a trade to journal.</div>}
    </article>
  </section>
);
