import React from "react";
import { Activity } from "lucide-react";

export const EdgeView = ({ data, edgeFinder, formatMetric }: any) => (
  <article className="panel animate-in fade-in duration-500">
    <div className="panel-heading">
      <div>
        <p>Opportunities</p>
        <h2>Edge Discovery</h2>
      </div>
      <div className="text-right">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Intelligence Layer™</p>
      </div>
      <Activity size={21} className="text-amber" />
    </div>
    <p className="text-xs text-slate-400 mb-6 -mt-2">Find high probability market setups across sessions and weekdays.</p>
    {data.backtestTrades.length ? (
      <>
        <div className="edge-finding-grid grid grid-cols-5 gap-4 mb-8">
          {edgeFinder.findings.map((f: any) => (<div key={f.label} className={`edge-finding ${f.status}`}><span>{f.label}</span><strong>{f.value}</strong><em>{f.detail}</em></div>))}
        </div>
        <div className="grid grid-cols-2 gap-6">
           <article className="edge-table"><h3>Sessions</h3>{edgeFinder.sessions.map((r:any) => (<div key={r.label} className="edge-table-row"><span>{r.label}</span><strong>{formatMetric(r.netProfit)}</strong></div>))}</article>
           <article className="edge-table"><h3>Weekdays</h3>{edgeFinder.weekdays.map((r:any) => (<div key={r.label} className="edge-table-row"><span>{r.label}</span><strong>{formatMetric(r.netProfit)}</strong></div>))}</article>
        </div>
      </>
    ) : <div className="empty-state py-20 text-center">No trades available for edge analysis.</div>}
  </article>
);
