import React from "react";
import { SlidersHorizontal, Bot, Activity, Braces, ShieldCheck } from "lucide-react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MetricBox, ScoreRow } from "../../components/ui/Metrics";
import type { DashboardData } from "../../lib/types";

export const DashboardView = ({ data, onNavigate }: { data: DashboardData; onNavigate: any }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {data.metrics.map((metric) => (
        <MetricBox key={metric.label} label={metric.label} value={metric.value} trend={metric.status === 'positive' ? 'up' : 'down'} detail={metric.delta} />
      ))}
    </section>

    <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
      <article className="panel h-[430px]">
        <div className="panel-heading"><div><p>Equity Curve</p><h2>Overview</h2></div><SlidersHorizontal size={18} className="text-slate-400" /></div>
        <ResponsiveContainer width="100%" height="82%">
          <AreaChart data={data.equity}>
            <defs><linearGradient id="equity" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#35d0a3" stopOpacity={0.42} /><stop offset="100%" stopColor="#35d0a3" stopOpacity={0.02} /></linearGradient></defs>
            <CartesianGrid stroke="#263142" vertical={false} />
            <XAxis dataKey="day" stroke="#8b98aa" />
            <YAxis stroke="#8b98aa" />
            <Tooltip contentStyle={{ background: "#10141d", border: "1px solid #263142", borderRadius: 6 }} />
            <Area type="monotone" dataKey="value" stroke="#35d0a3" strokeWidth={2} fill="url(#equity)" />
          </AreaChart>
        </ResponsiveContainer>
      </article>
      <article className="panel">
        <div className="panel-heading"><div><p>AI Coach</p><h2>Latest Insights</h2></div><Bot className="text-mint" size={22} /></div>
        <div className="space-y-4 text-sm text-slate-300">
          <p className="leading-relaxed">{data.aiSummary || "Run a backtest to see AI coaching insights."}</p>
          {data.scores.map(([label, score]) => (<ScoreRow key={label} label={label} score={score} />))}
          <button className="primary-button full-button mt-2" onClick={() => onNavigate("coach")}><Bot size={16} /> Deep Analysis</button>
        </div>
      </article>
    </div>

    <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.8fr]">
      <article className="panel">
        <div className="panel-heading"><div><p>Edge Finder</p><h2>Session Matrix</h2></div><Activity className="text-amber" size={21} /></div>
        <div className="grid gap-2">{data.heatmap.map(([session, rr, win, pnl]) => (<div className="heat-row" key={session}><span>{session}</span><b>{rr}</b><b>{win}</b><b>{pnl}</b></div>))}</div>
      </article>
      <article className="panel">
        <div className="panel-heading"><div><p>Rules</p><h2>Current Stack</h2></div><Braces className="text-mint" size={21} /></div>
        {data.latestStrategy?.rules ? Object.entries(data.latestStrategy.rules).slice(0, 5).map(([k, v]) => (<div key={k} className="rule">{k}: {String(v)}</div>)) : <div className="empty-state">No active strategy.</div>}
      </article>
      <article className="panel">
        <div className="panel-heading"><div><p>Account</p><h2>Workspace</h2></div><ShieldCheck className="text-mint" size={21} /></div>
        <div className="risk-limit"><span>Live Readiness</span><strong>{data.latestBacktest ? "68%" : "0%"}</strong></div>
        <div className="risk-limit"><span>Active Strategies</span><strong>{data.strategies.length}</strong></div>
        <div className="risk-limit"><span>Desk</span><strong>{data.organization?.name || "None"}</strong></div>
      </article>
    </div>
  </div>
);
