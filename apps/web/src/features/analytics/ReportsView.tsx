import React from "react";
import { FileDown, FileSpreadsheet } from "lucide-react";
import type { DashboardData } from "../../lib/types";
import { exportToCsv } from "../../lib/utils";

export const ReportsView = ({ data }: { data: DashboardData }) => {
  const handleExportTrades = () => {
    const rows = data.backtestTrades.map(t => ({
      index: t.trade_index,
      ...t.payload
    }));
    exportToCsv(`trades_${new Date().toISOString().slice(0,10)}.csv`, rows);
  };

  return (
    <section className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-4 gap-4">{data.metrics.map(m => (<div key={m.label} className="metric-card"><span>{m.label}</span><strong>{m.value}</strong></div>))}</div>
      <article className="panel">
        <div className="panel-heading"><div><p>Portfolio</p><h2>Research Packages</h2></div><FileDown size={21} /></div>
        <div className="grid gap-4">
           <div className="p-6 panel bg-panel border-line flex items-center justify-between">
              <div><h3 className="font-bold">Trade Data Export</h3><p className="text-xs text-slate-500">Export active backtest ledger for external analysis.</p></div>
              <button className="secondary-button gap-2" onClick={handleExportTrades}><FileSpreadsheet size={14}/> Export CSV</button>
           </div>
           {data.researchProjects.map(p => (
             <div key={p.id} className="p-6 panel bg-panel border-line flex items-center justify-between">
                <div><h3 className="font-bold">{p.name}</h3><p className="text-xs text-slate-500">v{p.version} • {p.market_symbol} • {p.status}</p></div>
                <button className="secondary-button gap-2"><FileDown size={14}/> Export Research (PDF)</button>
             </div>
           ))}
           {!data.researchProjects.length && <div className="empty-state py-20 text-center text-slate-500">No projects available for reporting.</div>}
        </div>
      </article>
    </section>
  );
};
