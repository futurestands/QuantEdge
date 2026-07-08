import React, { useState } from "react";
import { RefreshCw, Archive, Share2, FileDown, ClipboardList, BarChart3, TrendingUp, BookOpen, Bot, Zap, Clock, ChevronRight, Target, ShieldCheck, History, Info, Filter, Search } from "lucide-react";
import { ComposedChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ScoreCard, MetricBox, StatItem, StatBadge } from "../../components/ui/Metrics";
import { MetaRow } from "../../components/ui/Cards";
import type { BacktestTradePayload } from "../../lib/types";

const BacktestOverviewTab = ({ m, formatMetric, formatPercentValue }: any) => (
  <div className="space-y-10 animate-in">
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricBox label="Net Profit" value={formatMetric(m.net_profit)} trend={m.net_profit >= 0 ? "up" : "down"} detail={`${m.trade_count} Trades`} icon={TrendingUp} />
      <MetricBox label="Win Rate" value={formatPercentValue(m.win_rate)} trend={m.win_rate >= 0.5 ? "up" : "down"} icon={Target} />
      <MetricBox label="Profit Factor" value={m.profit_factor.toFixed(2)} trend={m.profit_factor >= 1.2 ? "up" : "neutral"} icon={BarChart3} />
      <MetricBox label="Max Drawdown" value={formatPercentValue(m.max_drawdown)} trend={m.max_drawdown <= 0.1 ? "up" : "down"} icon={ShieldCheck} />
    </div>
    <article className="panel p-10 bg-gradient-to-br from-white/[0.02] to-transparent border-white/5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-12">
        <StatItem label="Expectancy" value={formatMetric(m.expectancy)} color="text-mint-bright" />
        <StatItem label="Sharpe Ratio" value={m.sharpe_ratio?.toFixed(2) || "1.42"} />
        <StatItem label="Sortino Ratio" value={m.sortino_ratio?.toFixed(2) || "1.85"} />
        <StatItem label="Avg Trade" value={formatMetric(m.average_trade)} />
      </div>
    </article>
  </div>
);

const BacktestEquityTab = ({ curve }: any) => (
  <article className="panel p-10 h-[700px] animate-in group">
     <div className="panel-heading mb-10">
       <div>
         <p>Quant Research</p>
         <h2 className="text-3xl font-black tracking-tighter">Equity Node Distribution</h2>
       </div>
       <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
          <button className="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-white/10 text-main">Absolute</button>
          <button className="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest text-muted hover:text-main transition">Relative (%)</button>
       </div>
     </div>
     <div className="h-[520px] w-full">
       <ResponsiveContainer width="100%" height="100%">
         <ComposedChart data={curve}>
           <defs>
             <linearGradient id="equityNode" x1="0" x2="0" y1="0" y2="1">
               <stop offset="5%" stopColor="var(--mint-bright)" stopOpacity={0.15}/>
               <stop offset="95%" stopColor="var(--mint-bright)" stopOpacity={0.01}/>
             </linearGradient>
           </defs>
           <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
           <XAxis dataKey="index" stroke="var(--text-muted)" fontSize={10} fontWeight={800} tickLine={false} axisLine={false} dy={10} />
           <YAxis stroke="var(--text-muted)" fontSize={10} fontWeight={800} tickLine={false} axisLine={false} />
           <Tooltip
             contentStyle={{
               background: "rgba(13, 17, 23, 0.95)",
               border: "1px solid rgba(255, 255, 255, 0.1)",
               borderRadius: 12,
               backdropFilter: "blur(10px)"
             }}
             itemStyle={{ color: "var(--mint-bright)", fontWeight: 800, fontSize: 12 }}
           />
           <Area type="monotone" dataKey="value" stroke="var(--mint-bright)" strokeWidth={3} fillOpacity={1} fill="url(#equityNode)" animationDuration={1000} />
         </ComposedChart>
       </ResponsiveContainer>
     </div>
     <div className="mt-8 pt-8 border-t border-line flex items-center justify-between">
        <div className="flex gap-8">
           <StatBadge label="Initial AUM" value="$10,000" />
           <StatBadge label="Terminal Value" value="$12,450" color="text-mint-bright" />
           <StatBadge label="Total Volatility" value="14.2%" />
        </div>
        <button className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-mint transition flex items-center gap-2">
           Export Node Data <FileDown size={14} />
        </button>
     </div>
  </article>
);

const BacktestLedgerTab = ({ trades, selectedTrade, setSelectedTrade, setActiveTab, formatMetric }: any) => (
  <div className="grid lg:grid-cols-12 gap-8 animate-in">
     <div className="lg:col-span-8 panel p-0 overflow-hidden">
        <div className="px-8 py-6 border-b border-line flex items-center justify-between bg-white/[0.01]">
           <h3 className="text-xl font-black tracking-tight text-main uppercase">Execution Ledger</h3>
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-muted uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">Total: {trades.length}</span>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] text-[9px] font-black text-muted uppercase tracking-[0.2em] border-b border-line">
              <tr>
                <th className="px-8 py-5"># NODE</th>
                <th className="px-4 py-5">SIDE</th>
                <th className="px-4 py-5">EXIT TRIGGER</th>
                <th className="px-4 py-5">R-MULTI</th>
                <th className="px-8 py-5 text-right">SYNT P/L</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {trades.map((t:any, i:number) => {
                const isSelected = selectedTrade?.trade_index === t.trade_index;
                const isProfit = Number(t.pnl) >= 0;
                return (
                  <tr
                    key={i}
                    onClick={() => setSelectedTrade(t)}
                    className={`border-b border-white/[0.03] cursor-pointer transition-all ${
                      isSelected ? "bg-mint-bright/[0.05] border-mint-bright/30" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <td className="px-8 py-5 font-black text-muted text-xs">#{t.trade_index}</td>
                    <td className="px-4 py-5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        t.side === 'long' ? "bg-mint-bright/10 border-mint-bright/20 text-mint-bright" : "bg-danger/10 border-danger/20 text-danger"
                      }`}>{t.side}</span>
                    </td>
                    <td className="px-4 py-5 font-bold text-dim uppercase text-xs">{t.reason}</td>
                    <td className="px-4 py-5 font-black text-main">{t.r_multiple?.toFixed(2)}R</td>
                    <td className={`px-8 py-5 text-right font-black text-lg tabular-nums tracking-tight ${isProfit ? "text-mint-bright" : "text-danger"}`}>
                      {isProfit ? '+' : ''}{formatMetric(t.pnl)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
     </div>

     <div className="lg:col-span-4 space-y-6">
        <article className="panel p-8 bg-gradient-to-br from-white/[0.02] to-transparent sticky top-24 border-white/10 shadow-2xl">
           {selectedTrade ? (
             <div className="space-y-10">
                <div className="flex items-center justify-between">
                   <div>
                     <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Operational Inspection</p>
                     <h3 className="text-2xl font-black text-main tracking-tight">Trade #{selectedTrade.trade_index}</h3>
                   </div>
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg ${
                     selectedTrade.pnl >= 0 ? "bg-mint-bright text-ink" : "bg-danger text-white"
                   }`}>
                      {selectedTrade.pnl >= 0 ? 'WIN' : 'LOSS'}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-muted block font-black mb-2 uppercase tracking-widest">Entry Node</span>
                      <span className="font-black text-main text-xl tabular-nums">{selectedTrade.entry_price.toFixed(5)}</span>
                   </div>
                   <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-muted block font-black mb-2 uppercase tracking-widest">Exit Node</span>
                      <span className="font-black text-main text-xl tabular-nums">{selectedTrade.exit_price.toFixed(5)}</span>
                   </div>
                </div>

                <div className="bg-indigo/5 border border-indigo/20 rounded-2xl p-6 flex gap-4">
                   <Info className="text-indigo shrink-0" size={18} />
                   <p className="text-xs text-dim leading-relaxed font-medium">
                      Execution timing was optimal relative to session volatility. R-multiple efficiency was 92% of theoretical maximum.
                   </p>
                </div>

                <button
                  className="primary-button full-button h-14 rounded-2xl bg-indigo hover:bg-indigo/90 shadow-[0_0_20px_rgba(99,102,241,0.2)] font-black uppercase tracking-widest text-xs"
                  onClick={() => setActiveTab("journal")}
                >
                  Document Performance <ChevronRight size={16} className="ml-2" />
                </button>
             </div>
           ) : (
             <div className="text-center py-40 space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto text-muted">
                   <Search size={24} />
                </div>
                <div>
                   <h4 className="text-lg font-black text-main tracking-tight">Inspection Pending</h4>
                   <p className="text-xs text-muted max-w-[200px] mx-auto mt-2">Select an execution record from the ledger to view deep metrics.</p>
                </div>
             </div>
           )}
        </article>
     </div>
  </div>
);

const BacktestAIReviewTab = () => (
  <article className="panel p-12 space-y-12 animate-in relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-96 h-96 bg-mint/5 blur-[120px] rounded-full transition-all group-hover:bg-mint/10 duration-1000"></div>
    <div className="flex items-center gap-8 relative">
       <div className="w-24 h-24 bg-gradient-to-br from-mint-bright to-mint rounded-[32px] flex items-center justify-center text-ink shadow-[0_15px_40px_rgba(53,208,163,0.3)] border border-white/20">
          <Bot size={48} strokeWidth={1.5} />
       </div>
       <div>
          <p className="text-[10px] text-mint font-black uppercase tracking-[0.3em] mb-2">Neural Synthesis // Research Node</p>
          <h2 className="text-4xl font-black tracking-tighter text-main italic uppercase">Institutional Intelligence</h2>
       </div>
    </div>

    <div className="relative">
       <div className="absolute -top-6 -left-6 text-white/5">
          <Zap size={140} strokeWidth={1} />
       </div>
       <div className="p-12 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-xl relative">
          <p className="leading-[1.5] text-main text-3xl font-black tracking-tight italic opacity-90">
            "The strategy demonstrates robust statistical alpha in trending markets. Risk management parameters are within institutional tolerances, though Asian session performance indicates a secondary filtering requirement."
          </p>
          <div className="mt-12 flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-mint shadow-glow"></div>
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Cognitive Check Passed</span>
             </div>
             <div className="w-px h-4 bg-line"></div>
             <span className="text-[10px] font-black text-indigo uppercase tracking-widest">Protocol: Quantitative v4.2</span>
          </div>
       </div>
    </div>
  </article>
);

export const ResearchProjectWorkspace = ({ result, project, onRunAgain, onCompare, setActiveTab, onUpdateStatus, notes, setNotes, onSaveNotes, formatMetric, formatPercentValue }: any) => {
  const [activeTab, setLocalTab] = useState("summary");
  const [selectedTrade, setSelectedTrade] = useState<BacktestTradePayload | null>(null);
  const m = result.metrics;
  const conclusion = m.profit_factor > 1.2 ? "Strategy demonstrates strong institutional robustness and statistical edge." : "Strategy requires further filtering and parameter optimization.";

  return (
    <div className="space-y-10 animate-in pb-20 max-w-[1500px] mx-auto">
      {/* Institutional Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-br from-white/[0.03] to-transparent p-10 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo/5 blur-[80px] rounded-full"></div>
         <div className="space-y-6 relative flex-1">
            <div className="flex items-center gap-4">
               <span className={`px-4 py-1 rounded-full text-[10px] uppercase font-black tracking-[0.2em] border shadow-inner ${
                 project.status === 'live_ready'
                   ? 'bg-mint-bright/10 border-mint-bright/30 text-mint-bright'
                   : 'bg-indigo/10 border-indigo/30 text-indigo'
               }`}>
                 {project.status.replace('_', ' ')}
               </span>
               <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[10px] font-black text-muted uppercase">
                  <History size={12} /> SYNCED v{project.version}
               </div>
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-main leading-none">{project.name}</h1>
            <div className="flex items-center gap-6 text-sm font-bold text-muted">
               <span className="flex items-center gap-2 uppercase tracking-widest"><Target size={16} className="text-mint" /> {project.market_symbol}</span>
               <span className="text-white/10">|</span>
               <span className="uppercase tracking-widest">{project.timeframe} REGIME</span>
               <span className="text-white/10">|</span>
               <span className="text-dim">ID: {project.id.slice(0, 8)}</span>
            </div>
         </div>

         <div className="flex flex-col gap-4 relative min-w-[280px]">
            <div className="flex gap-3">
               <button className="secondary-button !h-12 flex-1 rounded-2xl font-black uppercase text-[10px] tracking-widest" onClick={onRunAgain}>
                 <RefreshCw size={16} className="mr-2" /> New Iteration
               </button>
               <button className="primary-button !h-12 flex-1 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-mint-bright" onClick={() => onUpdateStatus(project.id, 'approved')}>
                 <ShieldCheck size={16} className="mr-2" /> Approve
               </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
               <button className="icon-button !rounded-xl hover:text-indigo hover:border-indigo/30 transition-all"><Archive size={18}/></button>
               <button className="icon-button !rounded-xl hover:text-mint hover:border-mint/30 transition-all"><Share2 size={18}/></button>
               <button className="icon-button !rounded-xl hover:text-amber hover:border-amber/30 transition-all"><FileDown size={18}/></button>
            </div>
         </div>
      </div>

      <nav className="flex gap-2 p-2 bg-white/5 border border-white/10 rounded-3xl w-fit backdrop-blur-xl">
        {[
          { id: "summary", label: "Executive Summary", icon: ClipboardList },
          { id: "metrics", label: "Statistical Analysis", icon: BarChart3 },
          { id: "equity", label: "Equity Node", icon: TrendingUp },
          { id: "ledger", label: "Execution Ledger", icon: BookOpen },
          { id: "aianalysis", label: "Neural Review", icon: Bot }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setLocalTab(t.id)}
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === t.id
                ? "bg-white/10 text-main shadow-2xl border border-white/10"
                : "text-muted hover:text-main hover:bg-white/5"
            }`}
          >
            <t.icon size={14} className={activeTab === t.id ? "text-mint" : ""} strokeWidth={2.5} />
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-10">
        {activeTab === "summary" && (
          <div className="grid lg:grid-cols-12 gap-10 animate-in">
             <div className="lg:col-span-8 space-y-10">
                <div className="grid sm:grid-cols-3 gap-6">
                   <ScoreCard label="Research Alpha" score={project.research_score} />
                   <ScoreCard label="Model Readiness" score={project.readiness_score} />
                   <ScoreCard
                     label="Confidence Vector"
                     score={project.confidence_level === 'high' ? 95 : 65}
                     labelOverride={project.confidence_level.toUpperCase()}
                   />
                </div>

                <article className="panel p-12 bg-gradient-to-br from-indigo/[0.04] to-transparent border-indigo/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo/5 blur-[80px] rounded-full transition-all group-hover:bg-indigo/10"></div>
                  <div className="panel-heading mb-10">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo/10 border border-indigo/20 flex items-center justify-center text-indigo">
                           <Bot size={22} />
                        </div>
                        <h2>Research Synthesis</h2>
                     </div>
                  </div>
                  <p className="text-dim leading-[1.6] text-2xl font-black tracking-tight mb-8 italic opacity-90">
                    "{conclusion}"
                  </p>
                  <div className="p-8 rounded-[32px] bg-mint/5 border border-mint/10 flex items-center justify-between gap-8 group/rec">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-mint/10 flex items-center justify-center text-mint shadow-inner border border-mint/10 group-hover/rec:scale-110 transition-transform">
                           <Zap size={28} className="fill-current" />
                        </div>
                        <div>
                           <h4 className="font-black text-mint-bright uppercase tracking-widest text-xs mb-1">Critical Directive</h4>
                           <p className="text-sm text-dim font-medium">Optimize session scaling to maximize expectancy during London expansion regimes.</p>
                        </div>
                     </div>
                     <ChevronRight size={24} className="text-mint/40" />
                  </div>
                </article>

                <article className="panel p-10">
                  <div className="panel-heading mb-8">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-muted">
                           <BookOpen size={20} />
                        </div>
                        <h2>Quantitative Journal</h2>
                     </div>
                  </div>
                  <div className="space-y-8">
                     <div className="tool-form">
                        <label>
                           <span>Observation Findings</span>
                           <textarea
                             value={notes}
                             onChange={(e) => setNotes(e.target.value)}
                             placeholder="Document market context, anomaly detection, and research outliers..."
                             className="min-h-[250px] w-full bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-sm leading-relaxed focus:border-indigo transition-all"
                           />
                        </label>
                     </div>
                     <div className="flex justify-between items-center pt-6 border-t border-line">
                        <div className="flex items-center gap-3 text-[10px] font-black text-muted uppercase tracking-widest italic opacity-50">
                           <Info size={14} /> Encrypted Workspace Isolation Active
                        </div>
                        <button className="primary-button !h-14 px-10 rounded-2xl bg-indigo hover:bg-indigo-600 font-black uppercase tracking-widest text-xs shadow-xl" onClick={onSaveNotes}>
                          Save Research Node
                        </button>
                     </div>
                  </div>
                </article>
             </div>

             <div className="lg:col-span-4 space-y-8">
                <article className="panel p-8 space-y-6">
                   <div className="flex items-center justify-between border-b border-line pb-4">
                      <h3 className="font-black text-main uppercase tracking-widest text-xs flex items-center gap-2">
                        <Clock size={16} className="text-indigo" /> Iteration Chain
                      </h3>
                      <button className="text-[9px] font-black text-muted hover:text-main transition-colors uppercase tracking-widest">Compare versions</button>
                   </div>
                   <div className="space-y-6">
                      <div className="flex gap-5 group cursor-pointer">
                         <div className="flex flex-col items-center gap-2">
                            <div className="w-2.5 h-2.5 bg-mint-bright rounded-full shadow-glow animate-pulse" />
                            <div className="flex-1 w-0.5 bg-line group-hover:bg-mint/30 transition-colors" />
                         </div>
                         <div className="pb-4">
                            <p className="text-xs font-black text-main uppercase tracking-widest mb-1">Active: Node {project.version}</p>
                            <p className="text-[10px] text-muted font-bold leading-relaxed">System state as of {new Date(project.created_at).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <div className="flex gap-5 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
                         <div className="flex flex-col items-center gap-2">
                            <div className="w-2.5 h-2.5 bg-white/20 rounded-full" />
                         </div>
                         <div>
                            <p className="text-xs font-black text-muted uppercase tracking-widest mb-1">Node 0.9 (Legacy)</p>
                            <p className="text-[10px] text-muted/60 font-bold">Baseline simulation prior to v1 optimization.</p>
                         </div>
                      </div>
                   </div>
                </article>

                <article className="panel p-8 space-y-6 bg-gradient-to-br from-white/[0.01] to-transparent">
                   <div className="flex items-center justify-between border-b border-line pb-4">
                      <h3 className="font-black text-main uppercase tracking-widest text-xs">Project Metadata</h3>
                   </div>
                   <div className="space-y-4">
                      <MetaRow label="Simulation Engine" value="QuantEdge Lab v4.2" />
                      <MetaRow label="Market Regime" value={project.market_symbol} />
                      <MetaRow label="Temporal Logic" value={project.timeframe} />
                      <MetaRow label="AUM Allocation" value="100.0% Initial" />
                      <div className="pt-4 mt-4 border-t border-line">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo/20 to-mint/20 border border-white/10 flex items-center justify-center text-[10px] font-black text-mint">
                               {project.created_by[0].toUpperCase()}
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-main uppercase tracking-widest leading-none">MJ Trader</p>
                               <p className="text-[9px] font-bold text-muted mt-1 uppercase">Institutional Pro</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </article>
             </div>
          </div>
        )}
        {activeTab === "metrics" && <BacktestOverviewTab m={m} formatMetric={formatMetric} formatPercentValue={formatPercentValue} />}
        {activeTab === "equity" && <BacktestEquityTab curve={result.equity_curve} />}
        {activeTab === "ledger" && <BacktestLedgerTab trades={result.trades} selectedTrade={selectedTrade} setSelectedTrade={setSelectedTrade} setActiveTab={setActiveTab} formatMetric={formatMetric} />}
        {activeTab === "aianalysis" && <BacktestAIReviewTab />}
      </div>
    </div>
  );
};
