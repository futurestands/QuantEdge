import React, { useState } from "react";
import { Terminal, Layers, Database, Search, Download, Upload, Link2, Calendar, Scale, WalletCards, History, Zap, TrendingUp, Braces, ChevronRight, Play, AlertCircle, Clock } from "lucide-react";
import { DataOption, LabPreviewItem } from "../../components/ui/Cards";
import { ComparisonWorkspace } from "./ComparisonWorkspace";
import { ResearchProjectWorkspace } from "./ResearchProjectWorkspace";

export const BacktestingLab = ({ data, markets, isRunning, onSubmit, selectedStrategyId, setSelectedStrategyId, selectedMarketKey, setSelectedMarketKey, backtestStartAt, setBacktestStartAt, backtestEndAt, setBacktestEndAt, progress, statusMessage, lastResult, setLastResult, isSignedIn, onAuthRequired, initialBalance, setInitialBalance, riskPerTrade, setRiskPerTrade, commission, setCommission, spread, setSpread, slippage, setSlippage, setActiveTab, activeProject, handleUpdateProjectStatus, notes, setNotes, onSaveNotes, formatMetric }: any) => {
  const [step, setStep] = useState(1);
  const [compareBacktestId, setCompareBacktestId] = useState<string | null>(null);
  const selectedStrategy = data.strategies.find((s:any) => s.id === selectedStrategyId);
  const selectedMarket = markets.find((m:any) => `${m.symbolId}:${m.timeframe}` === selectedMarketKey);
  const canRun = selectedStrategy && selectedMarket && backtestStartAt && backtestEndAt && initialBalance > 0;

  if (lastResult && activeProject) {
    if (compareBacktestId) return <ComparisonWorkspace current={lastResult} previous={data.latestBacktest} onBack={() => setCompareBacktestId(null)} />;
    return <ResearchProjectWorkspace result={lastResult} project={activeProject} onRunAgain={() => { setLastResult(null); setStep(1); }} onCompare={() => setCompareBacktestId("latest")} setActiveTab={setActiveTab} onUpdateStatus={handleUpdateProjectStatus} notes={notes} setNotes={setNotes} onSaveNotes={onSaveNotes} formatMetric={formatMetric} />;
  }

  if (isRunning) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10 animate-in">
      <div className="relative">
        <div className="w-32 h-32 rounded-full border-2 border-white/5 flex items-center justify-center">
           <div className="absolute inset-0 border-4 border-transparent border-t-mint rounded-full animate-spin" />
           <Terminal className="text-mint animate-pulse" size={40} />
        </div>
        <div className="absolute -inset-10 bg-mint/5 blur-[60px] rounded-full -z-10 animate-glow"></div>
      </div>
      <div className="text-center space-y-8 max-w-xl">
        <div className="space-y-2">
           <h2 className="text-4xl font-black tracking-tighter text-main">{statusMessage}</h2>
           <p className="text-muted font-bold uppercase tracking-[0.3em] text-[10px]">Simulation Engine v3.0 // Multi-Threaded</p>
        </div>
        <div className="space-y-4">
           <div className="flex justify-between items-end">
              <div className="text-left">
                 <span className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1">Process Status</span>
                 <span className="text-xs font-bold text-dim uppercase">Synthesizing Candle Data...</span>
              </div>
              <span className="text-2xl font-black text-mint">{progress}%</span>
           </div>
           <div className="w-[400px] h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
              <div className="h-full bg-gradient-to-r from-indigo via-mint to-mint transition-all duration-700 rounded-full shadow-[0_0_20px_rgba(53,208,163,0.3)]" style={{ width: `${progress}%` }} />
           </div>
        </div>
      </div>
    </div>
  );

  if (markets.length === 0) return (
    <div className="max-w-4xl mx-auto py-40 animate-in">
       <article className="panel p-20 text-center flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.05),transparent_70%)] border-dashed border-white/5 rounded-[40px]">
          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-10 border border-white/5 shadow-2xl">
             <Database size={48} className="text-muted" strokeWidth={1} />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4 uppercase italic">Simulation Gated // Data Missing</h2>
          <p className="text-muted mb-12 max-w-md mx-auto leading-relaxed text-lg">
             Backtesting cannot function without validated historical data. Connect a market source or import a dataset to begin institutional research.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
             <button className="primary-button !h-14 px-10 rounded-2xl bg-indigo shadow-xl" onClick={() => setActiveTab("imports")}>
                <Upload size={20} className="mr-2" /> Ingest Market Data
             </button>
             <button className="secondary-button !h-14 px-10 rounded-2xl border-white/10" onClick={() => setActiveTab("imports")}>
                <Search size={20} className="mr-2" /> Explore Sources
             </button>
          </div>
       </article>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-mint" size={16} />
            <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Strategy Research</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Backtesting Lab</h1>
          <p className="text-muted text-sm font-medium mt-1">High-fidelity historical simulation for quantitative validation.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
           <Layers size={14} className="text-mint" />
           <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Configuration Step {step} <span className="text-white/20 px-1">/</span> 6</span>
        </div>
      </header>

      <div className="grid grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-700 ${
              step > i ? "bg-mint shadow-[0_0_15px_rgba(53,208,163,0.5)]" : "bg-white/5"
            }`}
          />
        ))}
      </div>

      <div className="panel p-10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent">
        {/* Step 1: Sector */}
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-5 border-b border-line pb-8">
              <div className="w-14 h-14 rounded-2xl bg-mint/10 flex items-center justify-center text-mint">
                <Database size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-main uppercase italic">01 // Market Universe</h3>
                <p className="text-sm text-muted font-medium">Select the asset class for this research session.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {["Forex", "Stocks", "Crypto", "Indices", "Futures", "Options"].map(m => (
                <button
                  key={m}
                  onClick={() => setStep(2)}
                  disabled={m==='Options'}
                  className={`p-10 panel hover:border-mint-bright/40 transition-all text-left group relative bg-white/5 border-white/5 ${m==='Options'?'opacity-40 grayscale':''}`}
                >
                  <TrendingUp className="mb-4 text-muted group-hover:text-mint-bright transition-colors" size={28} strokeWidth={1.5} />
                  <strong className="block text-xl font-black uppercase tracking-tight text-main group-hover:text-mint-bright transition-colors">{m}</strong>
                  <ChevronRight size={16} className="absolute bottom-10 right-10 text-muted opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Source */}
        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-5 border-b border-line pb-8">
              <div className="w-14 h-14 rounded-2xl bg-mint/10 flex items-center justify-center text-mint">
                <Search size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-main uppercase italic">02 // Data Acquisition</h3>
                <p className="text-sm text-muted font-medium">Select your institutional data source or upload local datasets.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <DataOption label="Research Database" sub="Clean historical sets." icon={Database} active />
              <DataOption label="Cloud Ingest" sub="Live-sync API." icon={Download} />
              <DataOption label="CSV Manifest" sub="Manual upload." icon={Upload} />
              <DataOption label="Institutional Node" sub="Direct link." icon={Link2} disabled />
            </div>
            <div className="tool-form pt-4">
               <label>
                 <span>Target Dataset Manifest</span>
                 <select
                   value={selectedMarketKey}
                   onChange={e => setSelectedMarketKey(e.target.value)}
                   className="h-16 text-lg font-black uppercase tracking-tight bg-white/5 border-white/10 rounded-2xl w-full px-6 focus:border-mint transition-all"
                 >
                   <option value="">Select Research Dataset...</option>
                   {markets.map((m: any) => (
                     <option key={`${m.symbolId}:${m.timeframe}`} value={`${m.symbolId}:${m.timeframe}`}>
                       {m.symbol} // {m.timeframe} REGIME
                     </option>
                   ))}
                 </select>
               </label>
            </div>
            <div className="flex justify-between border-t border-line pt-10">
              <button className="secondary-button h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest" onClick={() => setStep(1)}>Back</button>
              <button className="primary-button h-14 px-10 rounded-2xl" onClick={() => setStep(3)} disabled={!selectedMarket}>
                Proceed to Chronology <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Chronology */}
        {step === 3 && (
          <div className="space-y-10 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-5 border-b border-line pb-8">
              <div className="w-14 h-14 rounded-2xl bg-mint/10 flex items-center justify-center text-mint">
                <Clock size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-main uppercase italic">03 // Temporal Boundaries</h3>
                <p className="text-sm text-muted font-medium">Define the precise period for historical playback.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
               <div className="tool-form">
                 <label>
                   <span>Research Start (Entry)</span>
                   <input
                     type="datetime-local"
                     value={backtestStartAt}
                     onChange={e => setBacktestStartAt(e.target.value)}
                     className="h-16 text-lg font-black bg-white/5 border-white/10 rounded-2xl"
                   />
                 </label>
               </div>
               <div className="tool-form">
                 <label>
                   <span>Research End (Exit)</span>
                   <input
                     type="datetime-local"
                     value={backtestEndAt}
                     onChange={e => setBacktestEndAt(e.target.value)}
                     className="h-16 text-lg font-black bg-white/5 border-white/10 rounded-2xl"
                   />
                 </label>
               </div>
            </div>
            <div className="bg-amber/5 border border-amber/20 rounded-2xl p-6 flex gap-4">
               <AlertCircle className="text-amber shrink-0" size={20} />
               <p className="text-xs text-amber/80 leading-relaxed font-medium">
                 Ensure the selected period contains sufficient volatility to test strategy edge. Minimal sample size of 50 trades recommended.
               </p>
            </div>
            <div className="flex justify-between border-t border-line pt-10">
              <button className="secondary-button h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest" onClick={() => setStep(2)}>Back</button>
              <button className="primary-button h-14 px-10 rounded-2xl" onClick={() => setStep(4)}>
                Configure Protocol <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Algorithm */}
        {step === 4 && (
          <div className="space-y-10 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-5 border-b border-line pb-8">
              <div className="w-14 h-14 rounded-2xl bg-mint/10 flex items-center justify-center text-mint">
                <Braces size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-main uppercase italic">04 // Strategy Protocol</h3>
                <p className="text-sm text-muted font-medium">Select the quantitative logic to be deployed in this simulation.</p>
              </div>
            </div>
            <div className="tool-form">
              <label>
                <span>Protocol Library</span>
                <select
                  value={selectedStrategyId}
                  onChange={e => setSelectedStrategyId(e.target.value)}
                  className="h-16 text-lg font-black uppercase tracking-tight bg-white/5 border-white/10 rounded-2xl w-full px-6 focus:border-mint transition-all"
                >
                  <option value="">Select Strategy Logic...</option>
                  {data.strategies.map((s:any) => (
                    <option key={s.id} value={s.id}>{s.name.toUpperCase()} ENGINE</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex justify-between border-t border-line pt-10">
              <button className="secondary-button h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest" onClick={() => setStep(3)}>Back</button>
              <button className="primary-button h-14 px-10 rounded-2xl" onClick={() => setStep(5)} disabled={!selectedStrategy}>
                Execution Logic <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Risk */}
        {step === 5 && (
          <div className="space-y-10 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-5 border-b border-line pb-8">
              <div className="w-14 h-14 rounded-2xl bg-mint/10 flex items-center justify-center text-mint">
                <Scale size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-main uppercase italic">05 // Risk Parameters</h3>
                <p className="text-sm text-muted font-medium">Define account constraints and execution frictions.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
               <div className="tool-form"><label><span>Account Capital</span><input type="number" value={initialBalance} onChange={e => setInitialBalance(Number(e.target.value))} className="h-16 font-black text-lg bg-white/5 border-white/10 rounded-2xl" /></label></div>
               <div className="tool-form"><label><span>Risk Per Trade (%)</span><input type="number" step="0.1" value={riskPerTrade} onChange={e => setRiskPerTrade(Number(e.target.value))} className="h-16 font-black text-lg bg-white/5 border-white/10 rounded-2xl" /></label></div>
               <div className="tool-form"><label><span>Commission (Per Trade)</span><input type="number" step="0.01" value={commission} onChange={e => setCommission(Number(e.target.value))} className="h-16 font-black text-lg bg-white/5 border-white/10 rounded-2xl" /></label></div>
               <div className="tool-form"><label><span>Simulated Slippage (Ticks)</span><input type="number" step="1" value={slippage} onChange={e => setSlippage(Number(e.target.value))} className="h-16 font-black text-lg bg-white/5 border-white/10 rounded-2xl" /></label></div>
            </div>
            <div className="flex justify-between border-t border-line pt-10">
              <button className="secondary-button h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest" onClick={() => setStep(4)}>Back</button>
              <button className="primary-button h-14 px-10 rounded-2xl" onClick={() => setStep(6)}>
                Summary Review <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div className="space-y-10 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-5 border-b border-line pb-8">
              <div className="w-14 h-14 rounded-2xl bg-mint/10 flex items-center justify-center text-mint shadow-[0_0_20px_rgba(53,208,163,0.2)]">
                <Play size={28} strokeWidth={2.5} className="fill-current ml-1" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-main uppercase italic">06 // Operational Review</h3>
                <p className="text-sm text-muted font-medium">Verify simulation parameters before initializing compute.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <LabPreviewItem label="Target Asset" value={selectedMarket?.symbol} icon={Search} />
              <LabPreviewItem label="Protocol" value={selectedStrategy?.name} icon={Braces} />
              <LabPreviewItem label="Data Density" value={`${selectedMarket?.candleCount.toLocaleString()} Candles`} icon={History} />
              <LabPreviewItem label="AUM" value={formatMetric(initialBalance)} icon={WalletCards} />
            </div>
            <div className="flex justify-between items-center border-t border-line pt-10">
              <button className="secondary-button h-16 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest" onClick={() => setStep(5)}>Previous</button>
              <button
                className="primary-button h-16 px-16 rounded-2xl text-lg font-black shadow-[0_0_30px_rgba(53,208,163,0.3)] hover:scale-105 active:scale-100 transition-all"
                onClick={() => isSignedIn ? onSubmit() : onAuthRequired()}
                disabled={!canRun}
              >
                Execute Simulation <Zap className="ml-3 fill-current" size={24} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
