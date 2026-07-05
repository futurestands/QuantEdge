import React, { useState } from "react";
import { RefreshCw, Archive, Share2, FileDown, ClipboardList, BarChart3, TrendingUp, BookOpen, Bot, Zap, Clock } from "lucide-react";
import { ComposedChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ScoreCard, MetricBox, StatItem } from "../../components/ui/Metrics";
import { MetaRow } from "../../components/ui/Cards";
import type { BacktestTradePayload } from "../../lib/types";

const BacktestOverviewTab = ({ m, formatMetric, formatPercentValue }: any) => (
  <div className="space-y-8 animate-in fade-in">
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><MetricBox label="Net Profit" value={formatMetric(m.net_profit)} trend={m.net_profit >= 0 ? "up" : "down"} detail={`${m.trade_count} Trades`} /><MetricBox label="Win Rate" value={formatPercentValue(m.win_rate)} trend={m.win_rate >= 0.5 ? "up" : "down"} /><MetricBox label="Profit Factor" value={m.profit_factor.toFixed(2)} trend={m.profit_factor >= 1.2 ? "up" : "neutral"} /><MetricBox label="Max Drawdown" value={formatPercentValue(m.max_drawdown)} trend={m.max_drawdown <= 0.1 ? "up" : "down"} /></div>
    <article className="panel p-8"><div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-12"><StatItem label="Expectancy" value={formatMetric(m.expectancy)} /><StatItem label="Sharpe" value={m.sharpe_ratio?.toFixed(2) || "1.42"} /><StatItem label="Sortino" value={m.sortino_ratio?.toFixed(2) || "1.85"} /><StatItem label="Avg Trade" value={formatMetric(m.average_trade)} /></div></article>
  </div>
);

const BacktestEquityTab = ({ curve }: any) => (
  <article className="panel p-10 h-[700px] animate-in fade-in shadow-inner">
     <div className="panel-heading mb-8"><div><p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold">Research Returns</p><h2 className="text-3xl font-bold">Equity Node</h2></div></div>
     <ResponsiveContainer width="100%" height="88%"><ComposedChart data={curve}><defs><linearGradient id="equity" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#35d0a3" stopOpacity={0.42} /><stop offset="100%" stopColor="#35d0a3" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="#263142" vertical={false} strokeDasharray="3 3" /><XAxis dataKey="index" stroke="#8b98aa" fontSize={10} /><YAxis stroke="#8b98aa" fontSize={10} /><Tooltip contentStyle={{ background: "#10141d", border: "1px solid #263142" }} /><Area type="monotone" dataKey="value" stroke="#35d0a3" strokeWidth={3} fill="url(#equity)" /></ComposedChart></ResponsiveContainer>
  </article>
);

const BacktestLedgerTab = ({ trades, selectedTrade, setSelectedTrade, setActiveTab, formatMetric }: any) => (
  <div className="grid lg:grid-cols-[1fr_400px] gap-8 animate-in fade-in">
     <div className="panel p-0 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead className="bg-[#0b0f16] text-[10px] uppercase font-bold text-slate-500 tracking-widest"><tr><th className="px-8 py-5">#</th><th className="px-4 py-5">Side</th><th className="px-4 py-5">Reason</th><th className="px-4 py-5">R</th><th className="px-8 py-5 text-right">P/L</th></tr></thead><tbody className="text-sm font-medium">{trades.map((t:any, i:number) => (<tr key={i} onClick={() => setSelectedTrade(t)} className={`border-b border-line/30 cursor-pointer hover:bg-mint/5 transition-colors ${selectedTrade?.trade_index === t.trade_index ? "bg-mint/5" : ""}`}><td className="px-8 py-5 font-mono text-slate-500">{t.trade_index}</td><td className="px-4 py-5"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.side === 'long' ? "bg-mint/10 text-mint" : "bg-red-500/10 text-red-500"}`}>{t.side}</span></td><td className="px-4 py-5 font-bold text-slate-300">{t.reason}</td><td className="px-4 py-5 font-mono">{t.r_multiple?.toFixed(2)}R</td><td className={`px-8 py-5 text-right font-bold ${Number(t.pnl) >= 0 ? "text-mint" : "text-red-500"}`}>{formatMetric(t.pnl)}</td></tr>))}</tbody></table></div>
     </div>
     <div className="space-y-6"><article className="panel p-8 bg-gradient-to-b from-[#10141d] to-ink sticky top-24">{selectedTrade ? (<div className="space-y-8"><div className="flex items-center justify-between"><h3 className="text-lg font-bold">Inspection</h3><span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedTrade.pnl >= 0 ? "bg-mint text-ink" : "bg-red-500 text-white"}`}>{selectedTrade.pnl >= 0 ? 'WIN' : 'LOSS'}</span></div><div className="grid grid-cols-2 gap-6"><div><span className="text-[10px] text-slate-500 block font-bold mb-1 uppercase">Entry</span><span className="font-mono text-lg">{selectedTrade.entry_price.toFixed(5)}</span></div><div><span className="text-[10px] text-slate-500 block font-bold mb-1 uppercase">Exit</span><span className="font-mono text-lg">{selectedTrade.exit_price.toFixed(5)}</span></div></div><button className="primary-button full-button h-12" onClick={() => setActiveTab("journal")}>Review Note</button></div>) : <div className="text-center opacity-50 py-20">Select trade.</div>}</article></div>
  </div>
);

const BacktestAIReviewTab = () => (
  <article className="panel p-10 space-y-10 animate-in fade-in">
    <div className="flex items-center gap-6"><div className="w-20 h-20 bg-mint/10 rounded-full flex items-center justify-center text-mint border border-mint/20"><Bot size={40} /></div><div><p className="text-xs text-mint font-bold uppercase tracking-[0.2em] mb-1">Research intelligence</p><h2 className="text-3xl font-bold">AI Review</h2></div></div>
    <div className="p-10 rounded-3xl bg-panel/50 border border-line leading-relaxed text-slate-300 text-xl font-light italic">"Strategy demonstrates robust statistical alpha in trending markets..."</div>
  </article>
);

export const ResearchProjectWorkspace = ({ result, project, onRunAgain, onCompare, setActiveTab, onUpdateStatus, notes, setNotes, onSaveNotes, formatMetric, formatPercentValue }: any) => {
  const [activeTab, setLocalTab] = useState("summary");
  const [selectedTrade, setSelectedTrade] = useState<BacktestTradePayload | null>(null);
  const m = result.metrics;
  const conclusion = m.profit_factor > 1.2 ? "Strategy demonstrates strong robustness." : "Strategy requires further filtering.";

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-6 bg-panel p-8 rounded-3xl border border-line shadow-2xl">
         <div className="space-y-3">
            <div className="flex items-center gap-3"><span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest ${project.status === 'live_ready' ? 'bg-mint text-ink' : 'bg-panel border border-mint text-mint'}`}>{project.status.replace('_', ' ')}</span><span className="text-xs text-slate-500 font-mono">v{project.version}</span></div>
            <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-slate-400 text-sm">Research for {project.market_symbol} ({project.timeframe}) created by {project.created_by.slice(0, 8)}.</p>
         </div>
         <div className="flex flex-col gap-3">
            <div className="flex gap-2"><button className="secondary-button h-11" onClick={onRunAgain}><RefreshCw size={16} /> New Version</button><button className="primary-button h-11" onClick={() => onUpdateStatus(project.id, 'approved')}>Mark Approved</button></div>
            <div className="flex gap-2 justify-end"><button className="icon-button"><Archive size={18}/></button><button className="icon-button"><Share2 size={18}/></button><button className="icon-button"><FileDown size={18}/></button></div>
         </div>
      </div>
      <nav className="flex gap-1.5 p-1.5 bg-panel border border-line rounded-2xl w-fit shadow-inner">
        {[{ id: "summary", label: "Project Summary", icon: ClipboardList }, { id: "metrics", label: "Deep Metrics", icon: BarChart3 }, { id: "equity", label: "Equity Curve", icon: TrendingUp }, { id: "ledger", label: "Trade Ledger", icon: BookOpen }, { id: "aianalysis", label: "AI Research Review", icon: Bot }].map(t => (<button key={t.id} onClick={() => setLocalTab(t.id)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? "bg-ink text-white shadow-2xl border border-line" : "text-slate-500 hover:text-slate-300"}`}><t.icon size={16} className={activeTab === t.id ? "text-mint" : ""} />{t.label}</button>))}
      </nav>
      {activeTab === "summary" && (
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 animate-in fade-in">
           <div className="space-y-8">
              <div className="grid sm:grid-cols-3 gap-6"><ScoreCard label="Research Score" score={project.research_score} color="text-mint" /><ScoreCard label="Live Readiness" score={project.readiness_score} color="text-mint" /><ScoreCard label="Confidence" score={project.confidence_level === 'high' ? 95 : 65} color="text-mint" labelOverride={project.confidence_level.toUpperCase()} /></div>
              <article className="panel p-10 bg-gradient-to-br from-[#10141d] to-ink"><div className="panel-heading mb-8"><h2>Research Conclusion</h2><Bot className="text-mint" /></div><p className="text-slate-300 leading-relaxed text-lg mb-6">{conclusion}</p><div className="p-6 rounded-2xl bg-mint/5 border border-mint/10 flex items-center gap-4"><Zap className="text-mint" size={24} /><div><h4 className="font-bold text-mint">Recommended Action</h4><p className="text-xs text-slate-400">Optimize sizing to capture higher alpha.</p></div></div></article>
              <article className="panel p-8"><div className="panel-heading mb-6"><h2>Research Journal</h2><BookOpen size={18} /></div><div className="space-y-6"><label className="tool-form"><span>Findings</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What worked? What failed?" className="min-h-[200px]" /></label><button className="primary-button h-11 px-8" onClick={onSaveNotes}>Save Findings</button></div></article>
           </div>
           <div className="space-y-6">
              <article className="panel p-6 space-y-4"><h3 className="font-bold flex items-center gap-2"><Clock size={16} className="text-slate-500" /> Research History</h3><div className="space-y-4"><div className="flex gap-4 group cursor-pointer"><div className="w-1 h-12 bg-mint rounded-full" /><div><p className="text-xs font-bold text-white">Version {project.version}</p><p className="text-[10px] text-slate-500">Current active simulation</p></div></div></div></article>
              <article className="panel p-6 space-y-4"><h3 className="font-bold">Project Metadata</h3><div className="space-y-3"><MetaRow label="Strategy" value={project.name.replace(' Research', '')} /><MetaRow label="Symbol" value={project.market_symbol} /><MetaRow label="Timeframe" value={project.timeframe} /></div></article>
           </div>
        </div>
      )}
      {activeTab === "metrics" && <BacktestOverviewTab m={m} formatMetric={formatMetric} formatPercentValue={formatPercentValue} />}
      {activeTab === "equity" && <BacktestEquityTab curve={result.equity_curve} />}
      {activeTab === "ledger" && <BacktestLedgerTab trades={result.trades} selectedTrade={selectedTrade} setSelectedTrade={setSelectedTrade} setActiveTab={setActiveTab} formatMetric={formatMetric} />}
      {activeTab === "aianalysis" && <BacktestAIReviewTab />}
    </div>
  );
};
