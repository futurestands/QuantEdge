import React from "react";
import { Plus, Braces, Zap, Target, Clock, Activity, ChevronRight, Save, History, Settings2, Code2, Globe } from "lucide-react";

export const BuilderView = ({ data, strategyName, setStrategyName, direction, setDirection, sessionFilter, setSessionFilter, emaFast, setEmaFast, emaSlow, setEmaSlow, rsiPeriod, setRsiPeriod, rsiMax, setRsiMax, stopLossAtr, setStopLossAtr, takeProfitRr, setTakeProfitRr, riskPerTrade, setRiskPerTrade, initialBalance, setInitialBalance, entryRule, setEntryRule, exitRule, setExitRule, onSubmit }: any) => (
  <div className="space-y-10 animate-in text-main max-w-[1500px] mx-auto">
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Braces className="text-mint" size={16} />
          <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Logic Laboratory</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter">Strategy Builder</h1>
        <p className="text-muted text-sm font-medium mt-1">Architect and synthesize institutional-grade quantitative trading systems.</p>
      </div>
      <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
         <Globe size={14} className="text-mint" />
         <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Execution Engine v5.2</span>
      </div>
    </header>

    <div className="grid gap-10 lg:grid-cols-12">
      {/* Configuration Form */}
      <article className="panel lg:col-span-7 p-10">
        <div className="panel-heading mb-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-mint/10 border border-mint/20 flex items-center justify-center text-mint">
                <Settings2 size={24} />
             </div>
             <div>
                <p>Synthesis</p>
                <h2>System Parameters</h2>
             </div>
          </div>
        </div>

        <form className="space-y-10" onSubmit={onSubmit}>
          <div className="tool-form">
             <label>
                <span>Protocol Designation</span>
                <input
                  value={strategyName}
                  onChange={e => setStrategyName(e.target.value)}
                  required
                  placeholder="e.g. Mean Reversion Alpha"
                  className="h-16 text-lg font-black bg-white/5 border-white/10 rounded-2xl px-6 focus:border-mint transition-all"
                />
             </label>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             <div className="tool-form">
                <label>
                   <span className="flex items-center gap-2"><Target size={14} className="text-muted" /> Directional Bias</span>
                   <select
                     value={direction}
                     onChange={e => setDirection(e.target.value)}
                     className="h-16 font-black uppercase tracking-tight bg-white/5 border-white/10 rounded-2xl px-6"
                   >
                     <option value="long">Long (Bullish)</option>
                     <option value="short">Short (Bearish)</option>
                   </select>
                </label>
             </div>
             <div className="tool-form">
                <label>
                   <span className="flex items-center gap-2"><Clock size={14} className="text-muted" /> Session Filter</span>
                   <select
                     value={sessionFilter}
                     onChange={e => setSessionFilter(e.target.value)}
                     className="h-16 font-black uppercase tracking-tight bg-white/5 border-white/10 rounded-2xl px-6"
                   >
                     <option value="any">Cross-Session (Any)</option>
                     <option value="london">London Major</option>
                     <option value="new_york">New York Major</option>
                     <option value="asian">Asian Major</option>
                   </select>
                </label>
             </div>
          </div>

          <div className="space-y-6">
             <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] block">Indicator Optimization</span>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "EMA Fast", value: emaFast, set: setEmaFast },
                  { label: "EMA Slow", value: emaSlow, set: setEmaSlow },
                  { label: "RSI Period", value: rsiPeriod, set: setRsiPeriod },
                  { label: "RSI Max", value: rsiMax, set: setRsiMax }
                ].map(param => (
                  <div key={param.label} className="tool-form">
                    <label>
                       <span className="text-[9px]">{param.label}</span>
                       <input
                         type="number"
                         value={param.value}
                         onChange={e => param.set(Number(e.target.value))}
                         className="h-14 font-black bg-white/5 border-white/10 rounded-xl px-4 text-center"
                       />
                    </label>
                  </div>
                ))}
             </div>
          </div>

          <div className="space-y-6">
             <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] block">Execution Guardrails</span>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "ATR SL (x)", value: stopLossAtr, set: setStopLossAtr, step: 0.1 },
                  { label: "TP (RR)", value: takeProfitRr, set: setTakeProfitRr, step: 0.1 },
                  { label: "Risk (%)", value: riskPerTrade, set: setRiskPerTrade, step: 0.1 },
                  { label: "Balance ($)", value: initialBalance, set: setInitialBalance, step: 100 }
                ].map(param => (
                  <div key={param.label} className="tool-form">
                    <label>
                       <span className="text-[9px]">{param.label}</span>
                       <input
                         type="number"
                         step={param.step}
                         value={param.value}
                         onChange={e => param.set(Number(e.target.value))}
                         className="h-14 font-black bg-white/5 border-white/10 rounded-xl px-4 text-center"
                       />
                    </label>
                  </div>
                ))}
             </div>
          </div>

          <div className="tool-form pt-4">
             <label>
                <span className="flex items-center gap-2"><Code2 size={14} className="text-muted" /> Entry Logic Definition</span>
                <div className="relative group">
                   <div className="absolute top-4 left-4 text-mint pointer-events-none">
                      <ChevronRight size={16} strokeWidth={3} />
                   </div>
                   <input
                     value={entryRule}
                     onChange={e => setEntryRule(e.target.value)}
                     placeholder="e.g. close crosses above ema_fast and rsi < 30"
                     className="h-16 font-mono text-sm bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 focus:border-mint transition-all"
                   />
                </div>
             </label>
          </div>

          <div className="pt-10 border-t border-line">
            <button
              className="primary-button !h-16 w-full rounded-2xl text-lg font-black shadow-[0_0_30px_rgba(53,208,163,0.2)] bg-mint-bright hover:scale-105 active:scale-100 transition-all"
              type="submit"
            >
              Synthesize Strategy <Save size={20} className="ml-3 fill-current" />
            </button>
          </div>
        </form>
      </article>

      {/* Vault / List */}
      <article className="lg:col-span-5 flex flex-col h-[940px]">
        <div className="panel flex-1 flex flex-col p-10">
          <div className="panel-heading mb-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-muted">
                  <History size={24} />
               </div>
               <div>
                  <p>Library</p>
                  <h2>Strategy Vault</h2>
               </div>
            </div>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
               {data.strategies.length} Saved
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4">
            <div className="grid gap-4">
              {data.strategies.length ? data.strategies.map((s: any) => (
                <div
                  key={s.id}
                  className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-mint/30 hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-main tracking-tight group-hover:text-mint transition-colors">{s.name}</h3>
                      <div className="flex items-center gap-3">
                         <span className="text-[9px] font-black uppercase text-muted tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                            {s.language.toUpperCase()}
                         </span>
                         <span className="text-[9px] font-bold text-muted/60">Updated {new Date(s.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted group-hover:text-main transition-colors cursor-pointer">
                       <Zap size={14} />
                    </div>
                  </div>

                  <div className="p-4 bg-ink/50 rounded-xl border border-white/5 relative overflow-hidden group/code">
                     <div className="absolute top-0 left-0 w-1 h-full bg-mint opacity-40"></div>
                     <code className="text-xs font-mono text-dim leading-relaxed block break-all whitespace-pre-wrap">
                        {String(s.rules.entry)}
                     </code>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                     <div className="flex items-center gap-1.5">
                        <Activity size={12} className="text-muted" />
                        <span className="text-[10px] font-bold text-muted/80">Edge Score: <span className="text-mint">82/100</span></span>
                     </div>
                     <div className="w-px h-2 bg-line"></div>
                     <div className="flex items-center gap-1.5">
                        <History size={12} className="text-muted" />
                        <span className="text-[10px] font-bold text-muted/80">142 Sims</span>
                     </div>
                  </div>
                </div>
              )) : (
                <div className="py-40 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-muted">
                    <Code2 size={30} strokeWidth={1} />
                  </div>
                  <p className="text-muted font-medium italic">No strategy protocols defined.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-line">
             <div className="p-6 rounded-2xl bg-indigo/5 border border-indigo/20 flex gap-4">
                <Code2 className="text-indigo shrink-0 mt-1" size={18} />
                <p className="text-xs text-indigo/80 leading-relaxed font-medium">
                   All saved strategies are encrypted and isolated within your institutional workspace. They can be deployed to the Backtesting Lab for multi-regime validation.
                </p>
             </div>
          </div>
        </div>
      </article>
    </div>
  </div>
);
