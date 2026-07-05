import React from "react";
import { X } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { CompStat } from "../../components/ui/Cards";

const buildEquityFromTrades = (trades: any[]) => {
  let equity = 10000;
  return [{ index: 0, value: 10000, drawdown: 0 }, ...trades.map((t, i) => {
    equity += Number(t.pnl || 0);
    return { index: i + 1, value: Math.round(equity), drawdown: 0 };
  })];
};

export const ComparisonWorkspace = ({ current, previous, onBack, formatMetric, formatPercentValue }: any) => (
  <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto pb-20">
     <div className="flex items-center justify-between"><button onClick={onBack} className="secondary-button h-10 px-4 gap-2 text-xs"><X size={14} /> Close Comparison</button></div>
     <div className="grid grid-cols-2 gap-8">
        <article className="panel p-8 bg-mint/5 border-mint/30 shadow-2xl"><div className="h-[200px] mb-8"><ResponsiveContainer width="100%" height="100%"><AreaChart data={current.equity_curve}><Area type="monotone" dataKey="value" stroke="#35d0a3" fill="#35d0a3" fillOpacity={0.1} strokeWidth={2} /></AreaChart></ResponsiveContainer></div><div className="grid grid-cols-2 gap-4"><CompStat label="Net Profit" value={formatMetric(current.metrics.net_profit)} primary /><CompStat label="Drawdown" value={formatPercentValue(current.metrics.max_drawdown)} /></div></article>
        <article className="panel p-8 bg-slate-500/5 border-slate-500/30"><div className="h-[200px] mb-8"><ResponsiveContainer width="100%" height="100%"><AreaChart data={buildEquityFromTrades(previous?.trades || [])}><Area type="monotone" dataKey="value" stroke="#8b98aa" fill="#8b98aa" fillOpacity={0.1} strokeWidth={2} /></AreaChart></ResponsiveContainer></div><div className="grid grid-cols-2 gap-4"><CompStat label="Net Profit" value={formatMetric(previous?.metrics?.net_profit)} /><CompStat label="Drawdown" value={formatPercentValue(previous?.metrics?.max_drawdown)} /></div></article>
     </div>
  </div>
);
