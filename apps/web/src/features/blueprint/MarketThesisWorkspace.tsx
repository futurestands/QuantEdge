import React, { useState } from "react";
import { Terminal, Plus, ShieldCheck, Map, TrendingUp } from "lucide-react";
import { createMarketThesis, createScenario, updateThesisScore } from "../../lib/dashboard";

export const MarketThesisWorkspace = ({ data, refresh }: any) => {
  const [symbol, setSymbol] = useState("EURUSD");
  const [bias, setBias] = useState("neutral");
  const [scenarios, setScenarios] = useState<any[]>([]);

  const activeThesis = data.activeThesis;

  const handleCreateThesis = async () => {
    if (!data.organization?.id || !data.tradingPlans?.[0]?.id) return;
    await createMarketThesis({
      organization_id: data.organization.id,
      trading_plan_id: data.tradingPlans[0].id,
      symbol,
      bias: bias as any,
      preparation_score: 50
    });
    refresh();
  };

  const handleAddScenario = async () => {
    if (!activeThesis) return;
    await createScenario({
      blueprint_id: activeThesis.id,
      label: `Scenario ${String.fromCharCode(65 + (activeThesis.scenarios?.length || 0))}`,
      direction: bias === 'bullish' ? 'long' : 'short',
      entry_zone_price: 1.0850,
      invalidation_price: 1.0800,
      target_price: 1.1000,
      status: 'waiting'
    });
    await updateThesisScore(activeThesis.id, Math.min(100, (activeThesis.scenarios?.length || 0 + 1) * 25 + 50));
    refresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-main">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Market Analysis</h1>
        <p className="text-muted mt-1">Develop and validate trading ideas. <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest ml-2">Blueprint Engine™</span></p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          {!activeThesis ? (
            <article className="panel p-12 text-center">
              <Terminal size={48} className="mx-auto text-muted mb-4" />
              <h2 className="text-xl font-bold mb-2">Create a trading blueprint before executing trades.</h2>
              <p className="text-muted mb-8 max-w-sm mx-auto">Prepare your institutional roadmap before the session begins. Define your bias and tactical scenarios.</p>
              <div className="flex justify-center gap-4">
                <input value={symbol} onChange={e => setSymbol(e.target.value)} className="bg-ink border border-line rounded px-4 py-2" placeholder="Symbol" />
                <button className="primary-button" onClick={handleCreateThesis}>Create Blueprint</button>
              </div>
            </article>
          ) : (
          <>
            <article className="panel">
              <div className="panel-heading"><div><p>Strategic Context</p><h2>{activeThesis.symbol} • {activeThesis.bias?.toUpperCase()}</h2></div><Map size={21} className="text-mint" /></div>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-ink border border-line">
                  <span className="text-[10px] text-muted uppercase font-bold">Preparation Score</span>
                  <div className="text-2xl font-bold text-mint">{activeThesis.preparation_score}%</div>
                </div>
                <div className="p-4 rounded-xl bg-ink border border-line">
                  <span className="text-[10px] text-muted uppercase font-bold">Risk Budget</span>
                  <div className="text-2xl font-bold">1.0%</div>
                </div>
                <div className="p-4 rounded-xl bg-ink border border-line">
                  <span className="text-[10px] text-muted uppercase font-bold">Status</span>
                  <div className="text-2xl font-bold text-amber">Active</div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Tactical Scenarios</h3>
                <button className="secondary-button !py-1 !px-3" onClick={handleAddScenario}><Plus size={14} /> Add Scenario</button>
              </div>

              <div className="grid gap-4">
                {activeThesis.scenarios?.map((s: any) => (
                  <div key={s.id} className="p-4 rounded-xl bg-panel border border-line flex justify-between items-center">
                    <div>
                      <div className="font-bold text-main">{s.label}</div>
                      <div className="text-xs text-muted">{s.direction.toUpperCase()} @ {s.entry_zone_price}</div>
                    </div>
                    <div className="text-xs font-bold px-2 py-1 bg-ink rounded border border-line text-muted">{s.status.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </article>
          </>
        )}
      </div>

      <div className="space-y-6">
        <article className="panel">
          <div className="panel-heading"><div><p>Institutional</p><h2>Market Structure</h2></div><TrendingUp size={18} className="text-muted" /></div>
          <div className="space-y-4">
            <div className="p-3 rounded bg-ink border border-line">
              <div className="text-[10px] text-muted uppercase mb-1">Weekly Bias</div>
              <div className="font-bold">Bullish Order Flow</div>
            </div>
            <div className="p-3 rounded bg-ink border border-line">
              <div className="text-[10px] text-muted uppercase mb-1">Daily Regime</div>
              <div className="font-bold">Trending</div>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading"><div><p>Quality Control</p><h2>Blueprint Readiness</h2></div><ShieldCheck size={18} className="text-mint" /></div>
          <p className="text-xs text-muted leading-relaxed">A readiness score of 80% is required to pass the Execution Firewall. Ensure you have defined at least two tactical scenarios.</p>
        </article>
      </div>
    </div>
  </div>
);
};
