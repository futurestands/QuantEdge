import React, { useState } from "react";
import { Terminal, Search, BarChart3, Database, Layers, Zap } from "lucide-react";
import { createMarketThesis, updateThesisScore } from "../../lib/dashboard";
import { ScenarioPlanner } from "./ScenarioPlanner";

export const MarketThesisWorkspace = ({ data, refresh }: any) => {
  const [symbol, setSymbol] = useState("EURUSD");
  const [bias, setBias] = useState("neutral");
  const [goal, setDailyGoal] = useState("");

  const handleInit = async () => {
    if (!data.organization?.id || !data.tradingPlans[0]?.id) return;
    const score = calculateScore();
    await createMarketThesis({
      organization_id: data.organization.id,
      trading_plan_id: data.tradingPlans[0].id,
      symbol,
      bias: bias as any,
      daily_goal: goal,
      preparation_score: score
    });
    refresh();
  };

  const calculateScore = () => {
    let s = 20;
    if (symbol) s += 20;
    if (bias !== 'neutral') s += 20;
    if (goal.length > 10) s += 40;
    return s;
  };

  const thesis = data.activeThesis;

  if (!thesis) {
    return (
      <div className="max-w-4xl mx-auto py-20 space-y-12 animate-in fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Market Thesis Workspace</h1>
          <p className="text-slate-400 text-lg">Define your hypothesis before the market opens.</p>
        </div>

        <article className="panel p-10 space-y-8 bg-gradient-to-b from-panel to-ink border-line shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8">
            <label className="tool-form"><span>Subject Market</span><input value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="e.g. BTCUSD" className="h-14 text-xl" /></label>
            <label className="tool-form"><span>Daily Bias</span><select value={bias} onChange={e => setBias(e.target.value)} className="h-14 text-xl"><option value="neutral">Neutral</option><option value="bullish">Bullish</option><option value="bearish">Bearish</option></select></label>
          </div>
          <label className="tool-form"><span>Primary Objective</span><textarea value={goal} onChange={e => setDailyGoal(e.target.value)} placeholder="What is your focus for today? (e.g. Waiting for liquidity sweep at 1.0850)" className="min-h-[150px] text-lg p-6" /></label>
          <button className="primary-button full-button h-16 text-xl font-bold shadow-2xl shadow-mint/20" onClick={handleInit}><Zap size={24} className="fill-mint" /> Initialize Market Thesis</button>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in max-w-7xl mx-auto">
      <header className="flex justify-between items-center bg-panel p-8 rounded-3xl border border-line shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3"><span className="text-[10px] uppercase font-black text-mint tracking-[0.2em] bg-mint/5 px-2 py-1 rounded border border-mint/20">Hypothesis Active</span><span className="text-xs text-slate-500 font-mono">ID: {thesis.id.slice(0, 8)}</span></div>
          <h1 className="text-3xl font-bold tracking-tight">{thesis.symbol} Thesis • {new Date(thesis.created_at).toLocaleDateString()}</h1>
        </div>
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Preparation Score</span>
          <div className="text-3xl font-black text-mint">{thesis.preparation_score}%</div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <section className="space-y-8">
          <article className="panel p-8">
            <div className="panel-heading mb-6"><div><p>Market Context</p><h2>Thesis Scenarios</h2></div><Layers size={21} className="text-slate-400" /></div>
            <ScenarioPlanner thesisId={thesis.id} scenarios={thesis.scenarios} onUpdate={refresh} />
          </article>
        </section>

        <aside className="space-y-6">
          <article className="panel p-6 bg-mint/5 border-mint/20">
             <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-mint">Daily Bias</h3>
             <div className="text-2xl font-black capitalize">{thesis.bias}</div>
          </article>
          <article className="panel p-6">
             <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-slate-500">Today's Goal</h3>
             <p className="text-slate-300 leading-relaxed italic">"{thesis.daily_goal}"</p>
          </article>
        </aside>
      </div>
    </div>
  );
};
