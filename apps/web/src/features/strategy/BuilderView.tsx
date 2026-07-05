import React from "react";
import { Plus, Braces } from "lucide-react";

export const BuilderView = ({ data, strategyName, setStrategyName, direction, setDirection, sessionFilter, setSessionFilter, emaFast, setEmaFast, emaSlow, setEmaSlow, rsiPeriod, setRsiPeriod, rsiMax, setRsiMax, stopLossAtr, setStopLossAtr, takeProfitRr, setTakeProfitRr, riskPerTrade, setRiskPerTrade, initialBalance, setInitialBalance, entryRule, setEntryRule, exitRule, setExitRule, onSubmit }: any) => (
  <section className="grid gap-6 xl:grid-cols-[1fr_1fr] animate-in fade-in duration-500">
    <article className="panel">
      <div className="panel-heading"><div><p>Strategy Builder</p><h2>New Strategy</h2></div><Plus size={21} /></div>
      <form className="tool-form" onSubmit={onSubmit}>
        <label><span>Name</span><input value={strategyName} onChange={e => setStrategyName(e.target.value)} required /></label>
        <div className="form-grid"><label><span>Side</span><select value={direction} onChange={e => setDirection(e.target.value)}><option value="long">Long</option><option value="short">Short</option></select></label><label><span>Session</span><select value={sessionFilter} onChange={e => setSessionFilter(e.target.value)}><option value="any">Any</option><option value="london">London</option><option value="new_york">New York</option></select></label></div>
        <div className="form-grid-four grid gap-3"><label><span>EMA F</span><input type="number" value={emaFast} onChange={e => setEmaFast(Number(e.target.value))} /></label><label><span>EMA S</span><input type="number" value={emaSlow} onChange={e => setEmaSlow(Number(e.target.value))} /></label><label><span>RSI P</span><input type="number" value={rsiPeriod} onChange={e => setRsiPeriod(Number(e.target.value))} /></label><label><span>RSI M</span><input type="number" value={rsiMax} onChange={e => setRsiMax(Number(e.target.value))} /></label></div>
        <div className="form-grid-four grid gap-3"><label><span>ATR SL</span><input type="number" step="0.1" value={stopLossAtr} onChange={e => setStopLossAtr(Number(e.target.value))} /></label><label><span>TP RR</span><input type="number" step="0.1" value={takeProfitRr} onChange={e => setTakeProfitRr(Number(e.target.value))} /></label><label><span>Risk %</span><input type="number" value={riskPerTrade} onChange={e => setRiskPerTrade(Number(e.target.value))} /></label><label><span>Balance</span><input type="number" value={initialBalance} onChange={e => setInitialBalance(Number(e.target.value))} /></label></div>
        <label><span>Entry Logic</span><input value={entryRule} onChange={e => setEntryRule(e.target.value)} /></label>
        <button className="primary-button mt-2" type="submit">Save Strategy</button>
      </form>
    </article>
    <article className="panel">
      <div className="panel-heading"><div><p>Vault</p><h2>Saved Strategies</h2></div><Braces size={21} /></div>
      <div className="strategy-list">{data.strategies.length ? data.strategies.map((s: any) => (<div className="strategy-row" key={s.id}><strong>{s.name}</strong><span>{s.language}</span><code>{String(s.rules.entry)}</code></div>)) : <div className="empty-state py-20 text-center">No strategies found.</div>}</div>
    </article>
  </section>
);
