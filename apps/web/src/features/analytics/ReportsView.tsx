import React from "react";
import { FileDown, FileSpreadsheet, WalletCards, ShieldCheck, Activity, BarChart3, ChevronRight, FileText, Share2, Archive } from "lucide-react";
import type { DashboardData } from "../../lib/types";
import { exportToCsv } from "../../lib/utils";
import { MetricBox } from "../../components/ui/Metrics";

export const ReportsView = ({ data }: { data: DashboardData }) => {
  const handleExportTrades = () => {
    const rows = data.backtestTrades.map(t => ({
      index: t.trade_index,
      ...t.payload
    }));
    exportToCsv(`quantedge_trades_${new Date().toISOString().slice(0,10)}.csv`, rows);
  };

  return (
    <div className="space-y-10 animate-in text-main max-w-[1400px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <WalletCards className="text-mint" size={16} />
            <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Institutional Portfolio</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Research Reports</h1>
          <p className="text-muted text-sm font-medium mt-1">Export high-fidelity strategy simulations and institutional research packages.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="secondary-button !h-12 px-6 rounded-2xl">
              <Archive size={16} className="mr-2" /> Archive Manager
           </button>
           <button className="primary-button !h-12 px-6 rounded-2xl">
              <Share2 size={16} className="mr-2" /> Share Reports
           </button>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {data.metrics.map((m, idx) => (
          <MetricBox
            key={m.label}
            label={m.label}
            value={m.value}
            trend={m.status === 'positive' ? 'up' : 'down'}
            detail={m.delta}
            icon={idx === 0 ? Activity : idx === 1 ? BarChart3 : ShieldCheck}
          />
        ))}
      </section>

      <article className="panel flex flex-col p-10">
        <div className="panel-heading mb-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-muted">
                <FileDown size={24} />
             </div>
             <div>
                <p>Data Export</p>
                <h2>Research Manifests</h2>
             </div>
          </div>
        </div>

        <div className="grid gap-6">
           <div className="p-8 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-mint-bright/20 hover:bg-white/[0.04] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-mint-bright/10 flex items-center justify-center text-mint-bright shadow-inner border border-mint-bright/10 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet size={32} strokeWidth={1.5} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-main tracking-tight mb-1">Execution Ledger Export</h3>
                    <p className="text-sm text-muted font-medium max-w-md leading-relaxed">
                       Export the complete historical backtest ledger including entry/exit timestamps, P/L, and R-multiples for external quantitative analysis.
                    </p>
                 </div>
              </div>
              <button
                className="primary-button !h-14 px-10 rounded-2xl bg-white/5 border border-white/10 hover:border-mint-bright hover:bg-mint-bright hover:text-ink transition-all font-black uppercase tracking-widest text-[10px]"
                onClick={handleExportTrades}
              >
                 Download CSV Manifest <FileDown size={16} className="ml-3" />
              </button>
           </div>

           {data.researchProjects.length > 0 ? (
             data.researchProjects.map(p => (
               <div key={p.id} className="p-8 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-indigo/20 hover:bg-white/[0.04] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-2xl bg-indigo/10 flex items-center justify-center text-indigo shadow-inner border border-indigo/10 group-hover:scale-110 transition-transform">
                        <FileText size={32} strokeWidth={1.5} />
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h3 className="text-xl font-black text-main tracking-tight">{p.name}</h3>
                           <span className="px-2 py-0.5 rounded-full border border-indigo/20 bg-indigo/5 text-indigo text-[9px] font-black uppercase tracking-widest">v{p.version}</span>
                        </div>
                        <p className="text-sm text-muted font-medium">
                           {p.market_symbol} • {p.timeframe} • Status: <span className="text-dim uppercase">{p.status}</span>
                        </p>
                     </div>
                  </div>
                  <button className="primary-button !h-14 px-10 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo hover:bg-indigo hover:text-white transition-all font-black uppercase tracking-widest text-[10px]">
                     Export Portfolio PDF <FileDown size={16} className="ml-3" />
                  </button>
               </div>
             ))
           ) : (
             <div className="py-32 border-2 border-dashed border-white/5 rounded-[32px] text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-muted">
                   <Archive size={28} strokeWidth={1.5} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-main tracking-tight">Archive Repository Empty</h3>
                   <p className="text-sm text-muted max-w-[320px] mx-auto leading-relaxed">Execute simulation workflows to generate reportable research packages.</p>
                </div>
             </div>
           )}
        </div>
      </article>
    </div>
  );
};
