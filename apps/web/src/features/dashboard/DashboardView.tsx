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
  Lightbulb
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

  return (
    <div className="space-y-10 animate-in text-main">
      {/* Hero Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-mint/10 border border-mint/20 rounded-full text-[10px] font-black text-mint uppercase tracking-widest">System Online</span>
            <span className="text-muted flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <Calendar size={12} /> {currentDate}
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter leading-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">{data.organization?.name || "Trader"}</span> 👋
          </h1>
          <p className="text-muted text-sm font-medium mt-2 max-w-2xl">
            Your institutional terminal is synchronized. Systems are primed for the current {data.heatmap[0]?.[0] || "London"} session.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="primary-button group" onClick={() => onNavigate("backtests")}>
            <Zap size={16} className="fill-current" /> Launch Lab
          </button>
          <button className="secondary-button" onClick={() => onNavigate("live")}>
            <Activity size={16} /> Live Terminal
          </button>
        </div>
      </div>

      {/* KPI Grid */}
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

      {/* Main Analysis Section */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Equity Curve - Primary Chart */}
        <article className="panel lg:col-span-8 h-[520px] group">
          <div className="panel-heading">
            <div>
              <p>Performance Curve</p>
              <h2>Institutional Equity Growth</h2>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
              <button className="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-white/10 text-main">1D</button>
              <button className="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest text-muted hover:text-main transition">1W</button>
              <button className="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest text-muted hover:text-main transition">1M</button>
            </div>
          </div>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.equity}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--mint-bright)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--mint-bright)" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="var(--text-muted)"
                  fontSize={10}
                  fontWeight={800}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={10}
                  fontWeight={800}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v/1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(13, 17, 23, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 12,
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                  }}
                  itemStyle={{ color: "var(--mint-bright)", fontWeight: 800, fontSize: 12 }}
                  labelStyle={{ color: "var(--text-muted)", marginBottom: 4, fontSize: 10, fontWeight: 800 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--mint-bright)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#equityGradient)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-line pt-6">
            <div className="flex gap-10">
              <StatBadge label="Total Profit" value={data.metrics[0]?.value} color={data.metrics[0]?.status === 'positive' ? 'text-mint-bright' : 'text-danger'} />
              <StatBadge label="Peak Equity" value={`$${Math.max(...data.equity.map(e => e.value)).toLocaleString()}`} />
              <StatBadge label="Max Drawdown" value={data.metrics[3]?.value} color="text-danger" />
            </div>
            <button className="text-xs font-black uppercase tracking-widest text-muted hover:text-mint transition flex items-center gap-2">
              Advanced Analytics <ChevronRight size={14} />
            </button>
          </div>
        </article>

        {/* Readiness & AI Insight Side Panels */}
        <div className="lg:col-span-4 space-y-8">
          <article className="panel overflow-hidden border-mint/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-mint/5 blur-[60px] rounded-full"></div>
            <div className="panel-heading mb-6">
              <div>
                <p>Blueprint Status</p>
                <h2>Trading Readiness</h2>
              </div>
              <ShieldCheck className="text-mint" size={24} />
            </div>
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div className="text-4xl font-black tracking-tighter text-main">
                  {data.latestBacktest?.metrics?.readiness_score || 0}%
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-muted font-black uppercase tracking-widest">System Status</span>
                  <span className={`block text-xs font-bold uppercase ${data.latestBacktest ? 'text-mint' : 'text-amber'}`}>
                    {data.latestBacktest ? 'Validated' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-indigo via-mint to-mint rounded-full transition-all duration-1000"
                  style={{ width: `${data.latestBacktest?.metrics?.readiness_score || 0}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="block text-[9px] text-muted font-black uppercase tracking-widest mb-1">Session</span>
                  <span className="block text-xs font-bold text-main">{data.heatmap[0]?.[0] || "None"}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="block text-[9px] text-muted font-black uppercase tracking-widest mb-1">Volatility</span>
                  <span className="block text-xs font-bold text-dim">---</span>
                </div>
              </div>
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading mb-6">
              <div>
                <p>Intelligent Review</p>
                <h2>AI Coach Insights</h2>
              </div>
              <Bot className="text-indigo" size={24} />
            </div>
            <div className="space-y-6">
              <div className="bg-indigo/5 border border-indigo/20 rounded-xl p-4 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo/20 flex items-center justify-center shrink-0">
                  <Lightbulb size={20} className="text-indigo" />
                </div>
                <p className="text-xs leading-relaxed text-dim font-medium italic">
                  "{data.aiSummary?.slice(0, 120)}..."
                </p>
              </div>
              <div className="space-y-4">
                {data.scores.map(([label, score], idx) => (
                  <ScoreRow key={label} label={label} score={score} icon={idx === 0 ? Activity : idx === 1 ? Target : BarChart3} />
                ))}
              </div>
              <button
                className="secondary-button w-full justify-between hover:border-indigo/50 hover:bg-indigo/5 transition-all mt-2"
                onClick={() => onNavigate("coach")}
              >
                <span>Access Full Intelligence Layer</span>
                <ChevronRight size={16} className="text-muted" />
              </button>
            </div>
          </article>
        </div>
      </div>

      {/* Secondary Row: Market Matrix & Trades */}
      <div className="grid gap-8 lg:grid-cols-12">
        <article className="panel lg:col-span-4">
          <div className="panel-heading">
            <div>
              <p>Session Analysis</p>
              <h2>Probability Matrix</h2>
            </div>
            <Clock className="text-amber" size={20} />
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-4 px-4 text-[9px] font-black text-muted uppercase tracking-widest mb-2">
              <span>Session</span>
              <span>R-Multiple</span>
              <span>Win %</span>
              <span className="text-right">Net P/L</span>
            </div>
            {data.heatmap.map(([session, rr, win, pnl]) => (
              <div
                key={session}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <span className="text-xs font-black text-main uppercase tracking-widest">{session}</span>
                <div className="flex-1 grid grid-cols-3 text-right">
                  <span className="text-xs font-bold text-dim">{rr}</span>
                  <span className="text-xs font-bold text-dim">{win}</span>
                  <span className="text-xs font-black text-mint-bright">{pnl}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel lg:col-span-5">
          <div className="panel-heading">
            <div>
              <p>Execution Log</p>
              <h2>Recent Trade History</h2>
            </div>
            <History className="text-muted" size={20} />
          </div>
          <div className="space-y-3">
             {data.backtestTrades.slice(0, 5).map((trade, idx) => (
               <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-mint-bright/20 transition-all group">
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-[10px] ${
                      trade.payload.side === 'long' ? 'bg-mint-bright/10 text-mint-bright' : 'bg-danger/10 text-danger'
                    }`}>
                      {trade.payload.side.toUpperCase()}
                    </div>
                    <div>
                      <span className="block text-xs font-black text-main uppercase tracking-widest">EURUSD</span>
                      <span className="block text-[10px] text-muted font-bold">{new Date(trade.payload.entry_time).toLocaleDateString()}</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className={`block text-xs font-black uppercase tracking-widest ${
                      trade.payload.pnl > 0 ? 'text-mint-bright' : 'text-danger'
                    }`}>
                      {trade.payload.pnl > 0 ? '+' : ''}{trade.payload.pnl.toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-muted font-bold tracking-widest">{trade.payload.r_multiple.toFixed(1)}R</span>
                 </div>
               </div>
             ))}
             <button className="w-full py-3 text-[10px] font-black text-muted uppercase tracking-[0.2em] hover:text-main transition mt-2">
                View Full Execution Ledger
             </button>
          </div>
        </article>

        <article className="panel lg:col-span-3">
          <div className="panel-heading">
            <div>
              <p>System Rules</p>
              <h2>Active Protocol</h2>
            </div>
            <ShieldCheck className="text-mint" size={20} />
          </div>
          <div className="space-y-4">
             {data.latestStrategy?.rules ? (
               Object.entries(data.latestStrategy.rules).slice(0, 4).map(([k, v]) => (
                 <div key={k} className="rule !p-3 bg-white/5 border-white/5">
                    <span className="block text-[9px] text-muted font-black uppercase tracking-widest mb-1">{k}</span>
                    <code className="text-xs text-dim block truncate">{String(v)}</code>
                 </div>
               ))
             ) : (
               <div className="p-8 text-center text-muted italic text-xs">No active strategy protocol found.</div>
             )}
             <button className="primary-button w-full mt-4" onClick={() => onNavigate("builder")}>
                <TrendingUp size={16} /> Strategy Builder
             </button>
          </div>
        </article>
      </div>
    </div>
  );
};
