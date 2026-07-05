import React, { useState } from "react";
import { Terminal, Layers, Database, Search, Download, Upload, Link2, Calendar, Scale, WalletCards, History, Zap, TrendingUp, Braces } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 relative flex items-center justify-center"><div className="absolute inset-0 border-4 border-mint/10 border-t-mint rounded-full animate-spin" /><Terminal className="text-mint animate-pulse" size={32} /></div>
      <div className="text-center space-y-6 max-w-lg">
        <h2 className="text-3xl font-bold tracking-tight text-white">{statusMessage}</h2>
        <div className="space-y-2"><div className="flex justify-between text-xs font-mono text-slate-500"><span>RESEARCH ENGINE v3.0</span><span>{progress}%</span></div><div className="w-96 h-3 bg-panel border border-line rounded-full overflow-hidden p-0.5"><div className="h-full bg-gradient-to-r from-mint/50 to-mint transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} /></div></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold tracking-tight flex items-center gap-3"><Terminal className="text-mint" /> Research Laboratory</h1><p className="text-slate-400">Institutional-grade research workflow.</p></div><div className="flex items-center gap-2 px-4 py-2 bg-panel border border-line rounded-lg text-xs font-mono"><Layers size={14} className="text-mint" /> STEP {step} / 6</div></div>
      <div className="grid grid-cols-6 gap-2">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step > i ? "bg-mint shadow-[0_20px_50px_rgba(53,208,163,0.4)]" : "bg-panel border border-line"}`} />))}</div>
      <div className="panel p-10 space-y-8 shadow-2xl relative overflow-hidden bg-gradient-to-b from-[#10141d] to-[#0b0f16]">
        {step === 1 && (<div className="space-y-8 animate-in slide-in-from-right-4">
          <div className="flex items-center gap-4"><Database className="text-mint" size={28} /><div><h3 className="text-xl font-bold">Research Subject</h3><p className="text-sm text-slate-400">Select market sector.</p></div></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">{["Forex", "Stocks", "Crypto", "Indices", "Futures", "Options"].map(m => (<button key={m} onClick={() => setStep(2)} disabled={m==='Options'} className={`p-8 panel hover:border-mint transition-all text-left group relative ${m==='Options'?'opacity-50 grayscale':''}`}><TrendingUp className="mb-4 text-slate-400 group-hover:text-mint" size={24} /><strong className="block text-lg">{m}</strong></button>))}</div>
        </div>)}
        {step === 2 && (<div className="space-y-8 animate-in slide-in-from-right-4">
          <div className="flex items-center gap-4"><Search className="text-mint" size={28} /><div><h3 className="text-xl font-bold">Market Data Center</h3><p className="text-sm text-slate-400">Connect to data source.</p></div></div>
          <div className="grid md:grid-cols-2 gap-6"><DataOption label="Research Database" sub="Previously validated." icon={Database} active /><DataOption label="Cloud Provider" sub="Fetch live." icon={Download} /><DataOption label="Import CSV" sub="Upload file." icon={Upload} /><DataOption label="Broker Node" sub="Direct link." icon={Link2} disabled /></div>
          <label className="tool-form"><span>Select Dataset</span><select value={selectedMarketKey} onChange={e => setSelectedMarketKey(e.target.value)} className="h-14 text-lg"><option value="">Choose...</option>{markets.map((m: any) => (<option key={`${m.symbolId}:${m.timeframe}`} value={`${m.symbolId}:${m.timeframe}`}>{m.symbol} | {m.timeframe}</option>))}</select></label>
          <div className="flex justify-between border-t border-line pt-6"><button className="secondary-button h-12" onClick={() => setStep(1)}>Previous</button><button className="primary-button h-12" onClick={() => setStep(3)} disabled={!selectedMarket}>Next</button></div>
        </div>)}
        {step === 3 && (<div className="space-y-8 animate-in slide-in-from-right-4">
          <div className="flex items-center gap-4"><Calendar className="text-mint" size={28} /><div><h3 className="text-xl font-bold">Research Boundaries</h3><p className="text-sm text-slate-400">Define period.</p></div></div>
          <div className="form-grid"><label className="tool-form"><span>Start</span><input type="datetime-local" value={backtestStartAt} onChange={e => setBacktestStartAt(e.target.value)} className="h-14" /></label><label className="tool-form"><span>End</span><input type="datetime-local" value={backtestEndAt} onChange={e => setBacktestEndAt(e.target.value)} className="h-14" /></label></div>
          <div className="flex justify-between border-t border-line pt-6"><button className="secondary-button h-12" onClick={() => setStep(2)}>Previous</button><button className="primary-button h-12" onClick={() => setStep(4)}>Next</button></div>
        </div>)}
        {step === 4 && (<div className="space-y-8 animate-in slide-in-from-right-4">
          <div className="flex items-center gap-4"><Braces className="text-mint" size={28} /><div><h3 className="text-xl font-bold">Research Strategy</h3><p className="text-sm text-slate-400">Algorithm to test.</p></div></div>
          <label className="tool-form"><span>Library</span><select value={selectedStrategyId} onChange={e => setSelectedStrategyId(e.target.value)} className="h-14 text-lg"><option value="">Choose...</option>{data.strategies.map((s:any) => (<option key={s.id} value={s.id}>{s.name}</option>))}</select></label>
          <div className="flex justify-between border-t border-line pt-6"><button className="secondary-button h-12" onClick={() => setStep(3)}>Previous</button><button className="primary-button h-12" onClick={() => setStep(5)} disabled={!selectedStrategy}>Next</button></div>
        </div>)}
        {step === 5 && (<div className="space-y-8 animate-in slide-in-from-right-4">
          <div className="flex items-center gap-4"><Scale className="text-mint" size={28} /><div><h3 className="text-xl font-bold">Execution Engine</h3><p className="text-sm text-slate-400">Risk parameters.</p></div></div>
          <div className="grid sm:grid-cols-2 gap-6"><label className="tool-form"><span>Capital</span><input type="number" value={initialBalance} onChange={e => setInitialBalance(Number(e.target.value))} className="h-14" /></label><label className="tool-form"><span>Risk %</span><input type="number" step="0.1" value={riskPerTrade} onChange={e => setRiskPerTrade(Number(e.target.value))} className="h-14" /></label><label className="tool-form"><span>Commission</span><input type="number" step="0.01" value={commission} onChange={e => setCommission(Number(e.target.value))} className="h-14" /></label><label className="tool-form"><span>Slippage</span><input type="number" step="1" value={slippage} onChange={e => setSlippage(Number(e.target.value))} className="h-14" /></label></div>
          <div className="flex justify-between border-t border-line pt-6"><button className="secondary-button h-12" onClick={() => setStep(4)}>Previous</button><button className="primary-button h-12" onClick={() => setStep(6)}>Review</button></div>
        </div>)}
        {step === 6 && (<div className="space-y-8 animate-in slide-in-from-right-4">
          <div className="flex items-center gap-4"><Zap className="text-mint" size={28} /><div><h3 className="text-xl font-bold">Launch Research</h3><p className="text-sm text-slate-400">Review validation.</p></div></div>
          <div className="grid sm:grid-cols-4 gap-4"><LabPreviewItem label="Symbol" value={selectedMarket?.symbol} icon={Search} /><LabPreviewItem label="Algorithm" value={selectedStrategy?.name} icon={Braces} /><LabPreviewItem label="Candles" value={selectedMarket?.candleCount.toLocaleString()} icon={History} /><LabPreviewItem label="Capital" value={formatMetric(initialBalance)} icon={WalletCards} /></div>
          <div className="flex justify-between border-t border-line pt-6"><button className="secondary-button h-14" onClick={() => setStep(5)}>Previous</button><button className="primary-button h-14 px-12 text-lg font-bold shadow-2xl shadow-mint/30" onClick={() => isSignedIn ? onSubmit() : onAuthRequired()} disabled={!canRun}>Launch Research Simulation <Zap className="ml-3" size={20} /></button></div>
        </div>)}
      </div>
    </div>
  );
};
