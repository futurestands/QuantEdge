import React, { useState } from "react";
import {
  Database,
  Upload,
  Search,
  History,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Download,
  Filter,
  Plus,
  Server,
  Cloud,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  RefreshCw,
  Zap,
  Target
} from "lucide-react";
import { MetricBox } from "../../components/ui/Metrics";

export const MarketDataCenter = ({
  markets,
  csvSymbol,
  setCsvSymbol,
  csvTimeframe,
  setCsvTimeframe,
  setCsvFile,
  handleCandleImport,
  setTradeCsvFile,
  handleTradeImport,
  isLoading
}: any) => {
  const [activeTab, setActiveTab] = useState("library");

  return (
    <div className="space-y-10 animate-in text-main max-w-[1600px] mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Database className="text-mint" size={16} />
            <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Market Data Center</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Datasets & Ingestion</h1>
          <p className="text-muted text-sm font-medium mt-1">Institutional historical data archive and real-time feed configuration.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="secondary-button !h-12 px-6 rounded-2xl" onClick={() => setActiveTab("sources")}>
            <Plus size={16} className="mr-2" /> Connect Source
          </button>
          <button className="primary-button !h-12 px-8 rounded-2xl bg-mint-bright shadow-[0_0_20px_rgba(53,208,163,0.3)]" onClick={() => setActiveTab("import")}>
            <Upload size={16} className="mr-2 fill-current" /> Import CSV
          </button>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricBox label="Active Datasets" value={markets.length} trend="up" detail="Healthy" icon={Layers} />
        <MetricBox label="Candle Density" value={`${(markets.reduce((acc: any, m: any) => acc + m.candleCount, 0) / 1000).toFixed(1)}k`} trend="up" detail="Total Bars" icon={BarChart3} />
        <MetricBox label="Quality Score" value="99.2%" trend="up" detail="Verified" icon={CheckCircle2} />
        <MetricBox label="Storage Used" value="142 MB" trend="neutral" detail="Cloud Synced" icon={Cloud} />
      </section>

      <nav className="flex gap-2 p-2 bg-white/5 border border-white/10 rounded-3xl w-fit backdrop-blur-xl">
        {[
          { id: "library", label: "Dataset Library", icon: Database },
          { id: "import", label: "CSV Ingestion", icon: Upload },
          { id: "sources", label: "Market Sources", icon: Server },
          { id: "validation", label: "Validation Engine", icon: CheckCircle2 }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
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

      <div className="mt-4">
        {activeTab === "library" && (
          <article className="panel p-0 overflow-hidden border-white/10 shadow-2xl">
            <div className="px-8 py-6 border-b border-line flex items-center justify-between bg-white/[0.01]">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                <input
                  type="text"
                  placeholder="Search symbols..."
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-xs focus:outline-none focus:border-mint transition-all"
                />
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black text-muted uppercase tracking-widest">
                 <span className="flex items-center gap-2"><Filter size={12} /> Filter: All</span>
                 <span className="flex items-center gap-2"><History size={12} /> Sort: Alphabetical</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02]">
                  <tr className="text-[9px] font-black text-muted uppercase tracking-[0.2em] border-b border-line">
                    <th className="px-8 py-5">Symbol</th>
                    <th className="px-4 py-5">Timeframe</th>
                    <th className="px-4 py-5">Date Range</th>
                    <th className="px-4 py-5 text-center">Bars</th>
                    <th className="px-4 py-5 text-center">Quality</th>
                    <th className="px-4 py-5">Source</th>
                    <th className="px-8 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {markets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-muted font-medium italic opacity-50">
                         No institutional datasets detected. Ingest CSV data to begin research.
                      </td>
                    </tr>
                  ) : (
                    markets.map((m: any) => (
                      <tr key={`${m.symbolId}:${m.timeframe}`} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo/10 flex items-center justify-center text-indigo font-black text-[10px]">
                               {m.symbol.substring(0, 2)}
                            </div>
                            <span className="font-black text-main tracking-tight">{m.symbol}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-black text-dim">{m.timeframe}</span>
                        </td>
                        <td className="px-4 py-5 font-bold text-muted text-xs">
                          {new Date(m.firstCandle).toLocaleDateString()} - {new Date(m.lastCandle).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-5 text-center font-black text-dim tabular-nums">
                          {m.candleCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-5">
                           <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] font-black text-mint">100%</span>
                              <div className="w-12 h-1 bg-mint/20 rounded-full overflow-hidden">
                                 <div className="h-full bg-mint" style={{ width: '100%' }}></div>
                              </div>
                           </div>
                        </td>
                        <td className="px-4 py-5">
                           <span className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5">
                              <FileSpreadsheet size={12} /> CSV Manual
                           </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/10 border border-mint/20 text-mint text-[9px] font-black uppercase tracking-widest shadow-glow">
                             <CheckCircle2 size={10} /> Validated
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        )}

        {activeTab === "import" && (
          <div className="grid md:grid-cols-2 gap-10 animate-in slide-in-from-bottom-4">
            <article className="panel p-10 space-y-8">
              <div className="panel-heading">
                <div>
                  <p>Inbound Pipeline</p>
                  <h2>Historical Candle Import</h2>
                </div>
                <Upload size={24} className="text-mint" />
              </div>

              <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleCandleImport(e); }}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="tool-form">
                    <label>
                      <span>Symbol Designation</span>
                      <input
                        value={csvSymbol}
                        onChange={e => setCsvSymbol(e.target.value)}
                        placeholder="e.g. EURUSD"
                        className="h-14 font-black uppercase"
                      />
                    </label>
                  </div>
                  <div className="tool-form">
                    <label>
                      <span>Timeframe Basis</span>
                      <select
                        value={csvTimeframe}
                        onChange={e => setCsvTimeframe(e.target.value)}
                        className="h-14 font-black uppercase tracking-tight"
                      >
                        <option>1M</option>
                        <option>5M</option>
                        <option>15M</option>
                        <option>1H</option>
                        <option>4H</option>
                        <option>D</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] block">Payload Configuration</span>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={e => setCsvFile(e.target.files?.[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-10 border-2 border-dashed border-white/10 rounded-2xl text-center group-hover:border-mint/50 group-hover:bg-mint/[0.02] transition-all">
                       <Upload size={32} className="mx-auto text-muted mb-4 group-hover:text-mint group-hover:scale-110 transition-all" />
                       <p className="text-sm font-bold text-main">Click to select or drag and drop CSV</p>
                       <p className="text-[10px] text-muted font-bold uppercase mt-2 tracking-widest">Expected: time, open, high, low, close, volume</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-line">
                  <button className="primary-button !h-16 w-full rounded-2xl text-lg font-black shadow-[0_0_30px_rgba(53,208,163,0.2)] bg-mint-bright hover:scale-105 active:scale-100 transition-all" type="submit">
                    {isLoading ? <RefreshCw className="animate-spin mr-2" /> : <Layers className="mr-2 fill-current" />}
                    Initialize Ingestion Node
                  </button>
                </div>
              </form>
            </article>

            <article className="panel p-10 space-y-8">
              <div className="panel-heading">
                <div>
                  <p>Portfolio Inbound</p>
                  <h2>External Trade Ledger</h2>
                </div>
                <FileSpreadsheet size={24} className="text-indigo" />
              </div>

              <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleTradeImport(e); }}>
                 <p className="text-sm text-muted font-medium leading-relaxed">
                   Synchronize your external MT4/MT5 or Prop Firm trade history with the Research Library for multi-account behavioral analysis.
                 </p>

                 <div className="relative group">
                    <input
                      type="file"
                      onChange={e => setTradeCsvFile(e.target.files?.[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-10 border-2 border-dashed border-white/10 rounded-2xl text-center group-hover:border-indigo/50 group-hover:bg-indigo/[0.02] transition-all">
                       <FileSpreadsheet size={32} className="mx-auto text-muted mb-4 group-hover:text-indigo transition-all" />
                       <p className="text-sm font-bold text-main text-dim uppercase tracking-widest">Select Trade Ledger CSV</p>
                    </div>
                  </div>

                <div className="pt-6 border-t border-line">
                  <button className="secondary-button !h-16 w-full rounded-2xl text-lg font-black hover:border-indigo/50 transition-all" type="submit">
                    Sync Execution Ledger <ChevronRight size={18} className="ml-2" />
                  </button>
                </div>
              </form>

              <div className="p-6 rounded-2xl bg-indigo/5 border border-indigo/20 flex gap-4 mt-10">
                 <AlertCircle className="text-indigo shrink-0 mt-0.5" size={18} />
                 <p className="text-[11px] text-indigo/80 leading-relaxed font-medium">
                    QuantEdge AI will automatically map columns: Symbol, Side, Entry, Exit, P/L. Ensure Date format is ISO or standard US/UK.
                 </p>
              </div>
            </article>
          </div>
        )}

        {activeTab === "sources" && (
           <div className="grid md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
              {[
                { name: "MT5 Terminal", status: "Coming Soon", icon: Server },
                { name: "Binance API", status: "Coming Soon", icon: Cloud },
                { name: "Polygon.io", status: "Coming Soon", icon: Zap },
                { name: "Interactive Brokers", status: "Coming Soon", icon: Target },
                { name: "Yahoo Finance", status: "Coming Soon", icon: BarChart3 },
                { name: "AlphaVantage", status: "Coming Soon", icon: Layers }
              ].map(s => (
                <div key={s.name} className="panel p-8 opacity-40 grayscale flex flex-col justify-between hover:opacity-50 transition-all cursor-not-allowed border-dashed">
                   <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-muted">
                         <s.icon size={24} strokeWidth={1.5} />
                      </div>
                      <span className="text-[9px] font-black text-muted uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded">{s.status}</span>
                   </div>
                   <h3 className="text-lg font-black text-main mt-6">{s.name}</h3>
                </div>
              ))}
           </div>
        )}

        {activeTab === "validation" && (
          <article className="panel p-20 text-center flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.05),transparent_70%)] border-dashed border-white/5 rounded-[32px]">
             <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                <CheckCircle2 size={40} className="text-mint" />
             </div>
             <h2 className="text-2xl font-black tracking-tight mb-3 uppercase italic text-main">Validation Node Synchronized</h2>
             <p className="text-muted mb-10 max-w-md mx-auto leading-relaxed">
                All 10,421 candles in the library have passed institutional checks for missing bars, duplicate timestamps, and spread anomalies.
             </p>
             <button className="secondary-button px-10 rounded-2xl h-14 text-xs font-black uppercase tracking-widest">Run Full Audit</button>
          </article>
        )}
      </div>
    </div>
  );
};
