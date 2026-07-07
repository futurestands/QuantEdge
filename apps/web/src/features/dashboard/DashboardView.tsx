import React from "react";
import {
  TrendingUp,
  Bot,
  Activity,
  ShieldCheck,
  Zap,
  ChevronRight,
  Clock,
  Calendar,
  Wallet,
  Target,
  BarChart3,
  History,
  AlertTriangle,
  Lightbulb,
  Database,
  Layers,
  Search,
  Plus,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MetricBox, ScoreRow, StatBadge } from "../../components/ui/Metrics";
import type { DashboardData } from "../../lib/types";

export const DashboardView = ({ data, onNavigate }: { data: DashboardData; onNavigate: any }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const hasData = data.equity.length > 0 && data.equity[0].value !== 10000;
  const latestProject = data.researchProjects?.[0];

  return (
    <div className="space-y-10 animate-in text-main pb-20">
      {/* Institutional Command Center Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="px-3 py-1 bg-mint/10 border border-mint/20 rounded-full flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse shadow-glow"></div>
               <span className="text-[10px] font-black text-mint uppercase tracking-widest text-shadow-sm">System Operational</span>
            </div>
            <span className="text-muted flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
              <Calendar size={12} /> {currentDate}
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-tight">
            Terminal <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Mission Control</span>
          </h1>
          <p className="text-muted text-sm font-medium mt-2 max-w-2xl">
            Welcome back, <span className="text-main font-bold">{data.organization?.name || "Trader"}</span>. Your institutional research environment is synchronized.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <button className="secondary-button !h-12 px-6 rounded-2xl group border-white/10 hover:border-indigo/50" onClick={() => onNavigate("imports")}>
             <Database size={16} className="mr-2 text-indigo group-hover:scale-110 transition-transform" /> Import Market Data
           </button>
           <button className="secondary-button !h-12 px-6 rounded-2xl group border-white/10 hover:border-mint/50" onClick={() => onNavigate("builder")}>
             <Plus size={16} className="mr-2 text-mint group-hover:scale-110 transition-transform" /> New Strategy
           </button>
           <button className="primary-button !h-12 px-8 rounded-2xl bg-mint-bright shadow-[0_0_30px_rgba(53,208,163,0.3)] hover:scale-105 transition-all" onClick={() => onNavigate("backtests")}>
             <Zap size={16} className="mr-2 fill-current" /> Execute Simulation
           </button>
        </div>
      </div>

      {/* Quick Status Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 p-1 bg-white/5 border border-white/10 rounded-[28px]">
         {[
           { label: "Workspace", value: data.organization?.name || "Personal", icon: Layers, color: "text-indigo" },
           { label: "Broker", value: "Disconnected", icon: Activity, color: "text-rose-500" },
           { label: "Data Latency", value: "12ms", icon: Clock, color: "text-mint" },
           { label: "Active Project", value: latestProject?.name || "None", icon: Target, color: "text-amber" },
           { label: "Discipline Score", value: "98.4", icon: ShieldCheck, color: "text-mint" },
           { label: "Readiness", value: `${data.latestBacktest?.metrics?.readiness_score || 0}%`, icon: Zap, color: "text-mint" }
         ].map((status, idx) => (
           <div key={idx} className="flex flex-col p-4 rounded-[22px] hover:bg-white/5 transition-colors group cursor-default">
              <div className="flex items-center gap-2 mb-1">
                 <status.icon size={12} className={`${status.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                 <span className="text-[9px] font-black text-muted uppercase tracking-widest">{status.label}</span>
              </div>
              <span className="text-xs font-black text-main truncate tracking-tight">{status.value}</span>
           </div>
         ))}
      </div>

      {/* KPI Section */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {data.metrics.map((metric, idx) => (
          <MetricBox
            key={metric.label}
            label={metric.label}
            value={metric.value}
            trend={metric.status === 'positive' ? 'up' : 'down'}
            detail={metric.delta}
            icon={idx === 0 ? Wallet : idx === 1 ? Target : idx === 2 ? BarChart3 : idx === 3 ? Activity : AlertTriangle}
          />
        ))}
      </section>

      {/* Primary Analytics Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Equity Curve - Primary Chart */}
        <article className="panel lg:col-span-8 h-[580px] group border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="absolute top-0 right-0 w-64 h-64 bg-mint/5 blur-[100px] rounded-full"></div>

          <div className="panel-heading mb-10">
            <div>
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mb-1 italic">Institutional Alpha Path</p>
              <h2 className="text-3xl font-black tracking-tighter uppercase">Equity Node Analysis</h2>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
              {['1D', '1W', '1M', '3M', 'YTD', 'ALL'].map(range => (
                <button key={range} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${range === '1M' ? 'bg-white/10 text-main shadow-lg border border-white/10' : 'text-muted hover:text-main hover:bg-white/5'}`}>{range}</button>
              ))}
            </div>
          </div>

          {!hasData ? (
            <div className="h-[360px] w-full flex flex-col items-center justify-center space-y-6">
               <div className="w-20 h-20 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-muted">
                  <Activity size={32} strokeWidth={1} />
               </div>
               <div className="text-center">
                  <h3 className="text-xl font-black tracking-tight text-main mb-2">No Research Data Available</h3>
                  <p className="text-muted text-sm max-w-xs mx-auto font-medium">Execute your first strategy simulation in the Backtesting Lab to visualize institutional alpha.</p>
               </div>
               <button className="primary-button !h-12 px-8 rounded-2xl bg-indigo shadow-xl" onClick={() => onNavigate("backtests")}>
                  Initialize Simulation Lab
               </button>
            </div>
          ) : (
            <>
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.equity}>
                    <defs>
                      <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--mint-bright)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--mint-bright)" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} fontWeight={800} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} fontWeight={800} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip
                      contentStyle={{ background: "rgba(13, 17, 23, 0.95)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 16, backdropFilter: "blur(12px)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
                      itemStyle={{ color: "var(--mint-bright)", fontWeight: 800, fontSize: 12 }}
                      labelStyle={{ color: "var(--text-muted)", marginBottom: 4, fontSize: 10, fontWeight: 800 }}
                    />
                    <Area type="monotone" dataKey="value" stroke="var(--mint-bright)" strokeWidth={4} fillOpacity={1} fill="url(#equityGradient)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-10 pt-10 border-t border-line flex items-center justify-between">
                <div className="flex gap-12">
                  <StatBadge label="Total Profit" value={data.metrics[0]?.value} color={data.metrics[0]?.status === 'positive' ? 'text-mint-bright' : 'text-danger'} />
                  <StatBadge label="Peak Equity" value={`$${Math.max(...data.equity.map(e => e.value)).toLocaleString()}`} />
                  <StatBadge label="Max Drawdown" value={data.metrics[3]?.value} color="text-danger" />
                </div>
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-mint transition flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl">
                  Deep Performance Audit <ChevronRight size={14} />
                </button>
              </div>
            </>
          )}
        </article>

        {/* Intelligence & Research Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <article className="panel p-8 bg-gradient-to-br from-indigo/[0.05] to-transparent border-indigo/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo/10 blur-[60px] rounded-full transition-all group-hover:scale-150 duration-1000"></div>
            <div className="panel-heading mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-indigo/20 flex items-center justify-center text-indigo border border-indigo/20 shadow-2xl">
                    <Bot size={22} strokeWidth={2.5} />
                 </div>
                 <div>
                   <p className="text-indigo font-black italic">Neural Link</p>
                   <h2 className="text-2xl font-black uppercase tracking-tight">AI Insights</h2>
                 </div>
              </div>
            </div>

            <div className="space-y-6 relative">
              <div className="bg-white/5 border border-white/5 rounded-[24px] p-6 group-hover:bg-white/[0.08] transition-all">
                <div className="flex items-center gap-3 mb-4 text-mint">
                   <Sparkles size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Recommended Directive</span>
                </div>
                <p className="text-sm leading-relaxed text-dim font-medium italic opacity-90">
                  "{data.aiSummary?.slice(0, 140)}..."
                </p>
              </div>

              <div className="space-y-4">
                {data.scores.map(([label, score], idx) => (
                  <ScoreRow key={label} label={label} score={score} icon={idx === 0 ? Activity : idx === 1 ? Target : BarChart3} />
                ))}
              </div>

              <button
                className="secondary-button w-full justify-between !h-14 px-6 rounded-2xl hover:border-indigo/50 hover:bg-indigo/5 transition-all group/btn"
                onClick={() => onNavigate("coach")}
              >
                <span className="text-[11px] font-black uppercase tracking-widest">Access Full Intelligence Layer</span>
                <ChevronRight size={18} className="text-muted group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </article>

          <article className="panel p-8">
            <div className="panel-heading mb-6 border-b border-line pb-4">
              <div>
                <p>Dataset Manifest</p>
                <h2>Market Library</h2>
              </div>
              <Database className="text-muted" size={20} />
            </div>
            <div className="space-y-3">
               {data.strategies.length > 0 ? data.strategies.slice(0, 3).map((strat, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group cursor-pointer" onClick={() => onNavigate("builder")}>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted group-hover:text-mint transition-colors">
                          <Plus size={18} strokeWidth={3} />
                       </div>
                       <div>
                          <span className="block text-xs font-black text-main uppercase tracking-widest">{strat.name}</span>
                          <span className="block text-[9px] text-muted font-bold mt-0.5 italic">v1.2 // Optimized</span>
                       </div>
                    </div>
                    <ArrowRight size={14} className="text-muted group-hover:translate-x-1 transition-transform" />
                 </div>
               )) : (
                 <div className="p-10 text-center space-y-4 border-2 border-dashed border-white/5 rounded-2xl opacity-50">
                    <History size={24} className="mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">No protocols archived</p>
                 </div>
               )}
               <button className="w-full py-4 text-[9px] font-black text-muted uppercase tracking-[0.3em] hover:text-main transition mt-2">
                 Synchronize All Nodes
               </button>
            </div>
          </article>
        </div>
      </div>

      {/* Tertiary Row: Execution Context */}
      <div className="grid gap-8 lg:grid-cols-12">
        <article className="panel lg:col-span-4 p-8">
          <div className="panel-heading mb-8">
            <div className="flex items-center gap-3">
              <Clock className="text-amber" size={20} />
              <div>
                <p>Session Context</p>
                <h2>Operational Matrix</h2>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-4 px-4 text-[9px] font-black text-muted uppercase tracking-widest mb-2 italic">
              <span>Session</span>
              <span>R-Multi</span>
              <span>Win %</span>
              <span className="text-right">Synthesized</span>
            </div>
            {data.heatmap.map(([session, rr, win, pnl]) => (
              <div key={session} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                <span className="text-xs font-black text-main uppercase tracking-widest">{session}</span>
                <div className="flex-1 grid grid-cols-3 text-right">
                  <span className="text-xs font-bold text-dim group-hover:text-main transition-colors">{rr}</span>
                  <span className="text-xs font-bold text-dim group-hover:text-main transition-colors">{win}</span>
                  <span className="text-xs font-black text-mint-bright tracking-tight tabular-nums">{pnl}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel lg:col-span-5 p-0 overflow-hidden border-white/10">
          <div className="px-8 py-6 border-b border-line flex items-center justify-between bg-white/[0.01]">
            <div>
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mb-1 italic">Execution Ledger</p>
              <h2 className="text-xl font-black tracking-tight uppercase">Recent Simulations</h2>
            </div>
            <History className="text-muted" size={18} />
          </div>
          <div className="overflow-y-auto max-h-[400px]">
             {data.backtestTrades.length > 0 ? (
               <table className="w-full text-left">
                  <thead className="bg-white/[0.02]">
                    <tr className="text-[9px] font-black text-muted uppercase tracking-[0.2em] border-b border-line">
                      <th className="px-8 py-4">Node</th>
                      <th className="px-4 py-4">Execution</th>
                      <th className="px-4 py-4">R</th>
                      <th className="px-8 py-4 text-right">P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.backtestTrades.slice(0, 8).map((trade, idx) => (
                      <tr key={idx} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => onNavigate("journal")}>
                        <td className="px-8 py-4 font-black text-muted text-[10px]">#{trade.trade_index}</td>
                        <td className="px-4 py-4">
                           <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${trade.payload.side === 'long' ? 'bg-mint/10 border-mint/20 text-mint' : 'bg-danger/10 border-danger/20 text-danger'}`}>
                              {trade.payload.side}
                           </span>
                        </td>
                        <td className="px-4 py-4 font-black text-dim text-xs">{trade.payload.r_multiple.toFixed(1)}R</td>
                        <td className={`px-8 py-4 text-right font-black text-sm tracking-tight tabular-nums ${trade.payload.pnl > 0 ? 'text-mint-bright' : 'text-danger'}`}>
                           {trade.payload.pnl > 0 ? '+' : ''}{trade.payload.pnl.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             ) : (
               <div className="p-20 text-center space-y-4 opacity-50">
                  <History size={32} className="mx-auto text-muted" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Execution ledger is void</p>
               </div>
             )}
          </div>
        </article>

        <article className="panel lg:col-span-3 p-8 border-mint/20 bg-mint/5 flex flex-col justify-between">
           <div className="space-y-6">
              <div className="panel-heading !mb-0">
                <div>
                  <p className="text-mint font-black italic tracking-widest">Guardian Node</p>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Active Plan</h2>
                </div>
                <ShieldCheck size={24} className="text-mint" />
              </div>
              <div className="p-6 rounded-[24px] bg-ink/50 border border-mint/20 shadow-inner">
                 <div className="flex justify-between items-end mb-4">
                    <div>
                       <span className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1 opacity-60">Session Discipline</span>
                       <span className="text-4xl font-black text-mint-bright tabular-nums">98.4</span>
                    </div>
                    <div className="text-right">
                       <span className="block text-[9px] font-black text-mint uppercase tracking-widest">Status</span>
                       <span className="block text-xs font-bold text-main uppercase">Optimal</span>
                    </div>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-mint via-mint-bright to-mint-bright shadow-[0_0_10px_rgba(53,208,163,0.5)]" style={{ width: '98%' }}></div>
                 </div>
              </div>
           </div>

           <div className="space-y-3 mt-8">
              <div className="risk-limit !p-4 bg-ink/30 border-white/5">
                 <span className="text-[10px] font-black uppercase tracking-widest">Drawdown Limit</span>
                 <strong className="text-main font-black">4.0%</strong>
              </div>
              <div className="risk-limit !p-4 bg-ink/30 border-white/5">
                 <span className="text-[10px] font-black uppercase tracking-widest">Max Exposure</span>
                 <strong className="text-main font-black">2.5%</strong>
              </div>
              <button className="primary-button full-button !h-14 rounded-2xl bg-mint hover:bg-mint-bright text-ink shadow-2xl" onClick={() => onNavigate("firewall")}>
                 Clear Firewall <ChevronRight size={18} className="ml-1" />
              </button>
           </div>
        </article>
      </div>
    </div>
  );
};
