import React, { useState } from "react";
import { Terminal, Plus, ShieldCheck, Map, TrendingUp, Search, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { createMarketThesis, createScenario, updateThesisScore } from "../../lib/dashboard";

export const MarketThesisWorkspace = ({ data, refresh }: any) => {
  const [symbol, setSymbol] = useState("EURUSD");
  const [bias, setBias] = useState("neutral");

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
    <div className="space-y-8 animate-in text-main max-w-[1400px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Map className="text-mint" size={16} />
            <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Blueprint Engine™</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Market Analysis</h1>
          <p className="text-muted text-sm font-medium mt-1">Develop and validate institutional trading blueprints.</p>
        </div>
        {!activeThesis && (
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
              <input
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:border-mint/50 transition-all w-48"
                placeholder="Search Symbol"
              />
            </div>
            <button className="primary-button" onClick={handleCreateThesis}>
              Initialize Blueprint
            </button>
          </div>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
          {!activeThesis ? (
            <article className="panel p-20 text-center flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.05),transparent_70%)]">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                <Terminal size={40} className="text-muted" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-3">No Active Blueprint Detected</h2>
              <p className="text-muted mb-10 max-w-md mx-auto leading-relaxed">
                Professional trading requires preparation. Initialize a blueprint for your target symbol to define your tactical roadmap before the session begins.
              </p>
              <div className="flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-2xl w-full max-w-sm">
                 <input
                   value={symbol}
                   onChange={e => setSymbol(e.target.value)}
                   className="bg-transparent border-none flex-1 px-4 py-2 text-sm focus:outline-none"
                   placeholder="e.g. EURUSD, XAUUSD"
                 />
                 <button className="primary-button !h-10 px-6 rounded-xl" onClick={handleCreateThesis}>Start Analysis</button>
              </div>
            </article>
          ) : (
            <article className="panel">
              <div className="panel-heading mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${
                      activeThesis.bias === 'bullish' ? 'bg-mint-bright' : activeThesis.bias === 'bearish' ? 'bg-danger' : 'bg-amber'
                    }`}></span>
                    <p>Current Strategic Thesis</p>
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">
                    {activeThesis.symbol} <span className="text-muted px-2">•</span>
                    <span className={activeThesis.bias === 'bullish' ? 'text-mint-bright' : activeThesis.bias === 'bearish' ? 'text-danger' : 'text-amber'}>
                      {activeThesis.bias?.toUpperCase()}
                    </span>
                  </h2>
                </div>
                <div className="flex gap-2">
                   <button className="secondary-button !h-9 !px-4 text-[10px] uppercase tracking-widest" onClick={handleAddScenario}>
                     <Plus size={14} className="mr-1" /> Add Tactical Scenario
                   </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 group hover:border-mint/30 transition-all">
                  <span className="text-[10px] text-muted uppercase font-black tracking-widest block mb-2">Preparation Score</span>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-black text-mint-bright">{activeThesis.preparation_score}%</div>
                    {activeThesis.preparation_score >= 80 ? (
                      <CheckCircle2 size={16} className="text-mint-bright mb-1" />
                    ) : (
                      <AlertCircle size={16} className="text-amber mb-1" />
                    )}
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/20 transition-all">
                  <span className="text-[10px] text-muted uppercase font-black tracking-widest block mb-2">Risk Allocation</span>
                  <div className="text-3xl font-black text-main">1.25%</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/20 transition-all">
                  <span className="text-[10px] text-muted uppercase font-black tracking-widest block mb-2">Confidence Level</span>
                  <div className="text-3xl font-black text-amber">High</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-4">Tactical Scenarios</h3>
                <div className="grid gap-4">
                  {activeThesis.scenarios?.length > 0 ? (
                    activeThesis.scenarios?.map((s: any) => (
                      <div key={s.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs ${
                            s.direction === 'long' ? 'bg-mint-bright/10 text-mint-bright' : 'bg-danger/10 text-danger'
                          }`}>
                            {s.direction.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-main text-lg tracking-tight">{s.label}</div>
                            <div className="text-xs text-muted font-medium flex items-center gap-2 mt-1">
                              <Info size={12} /> Execution Zone: {s.entry_zone_price} <span className="text-white/10">|</span> Invalidation: {s.invalidation_price}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-3 py-1 bg-ink rounded-lg border border-white/10 text-[10px] font-black text-muted uppercase tracking-widest">
                            {s.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 border-2 border-dashed border-white/5 rounded-2xl text-center text-muted italic text-sm">
                      No tactical scenarios defined yet. Click 'Add Tactical Scenario' to begin mapping your execution.
                    </div>
                  )}
                </div>
              </div>
            </article>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <article className="panel bg-gradient-to-br from-white/[0.03] to-transparent">
            <div className="panel-heading">
              <div>
                <p>Institutional Context</p>
                <h2>Market Structure</h2>
              </div>
              <TrendingUp size={20} className="text-muted" />
            </div>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] text-muted font-black uppercase tracking-widest mb-2">Weekly Bias</div>
                <div className="font-black text-main flex items-center justify-between">
                  Bullish Order Flow
                  <TrendingUp size={16} className="text-mint-bright" />
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] text-muted font-black uppercase tracking-widest mb-2">Daily Regime</div>
                <div className="font-black text-main">Trending High-Vol</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] text-muted font-black uppercase tracking-widest mb-2">Key HTF Levels</div>
                <div className="font-black text-dim text-xs leading-relaxed space-y-1 mt-1">
                   <div className="flex justify-between"><span>Resistance:</span> <span className="text-main">1.0920</span></div>
                   <div className="flex justify-between"><span>Pivot:</span> <span className="text-main">1.0850</span></div>
                   <div className="flex justify-between"><span>Support:</span> <span className="text-main">1.0780</span></div>
                </div>
              </div>
            </div>
          </article>

          <article className="panel border-mint/20 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-mint/5 blur-[80px] rounded-full"></div>
            <div className="panel-heading">
              <div>
                <p>Execution Firewall</p>
                <h2>Readiness Check</h2>
              </div>
              <ShieldCheck size={20} className="text-mint" />
            </div>
            <div className="space-y-5 relative">
              <p className="text-xs text-dim leading-relaxed font-medium">
                Institutional protocol requires a preparation score of <span className="text-mint-bright font-bold">80%</span> to pass the Execution Firewall.
              </p>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-[11px] font-bold text-main">
                    <CheckCircle2 size={14} className="text-mint-bright" /> Defined HTF Bias
                  </li>
                  <li className={`flex items-center gap-3 text-[11px] font-bold ${activeThesis?.scenarios?.length >= 2 ? 'text-main' : 'text-muted'}`}>
                    <CheckCircle2 size={14} className={activeThesis?.scenarios?.length >= 2 ? 'text-mint-bright' : 'text-muted/40'} /> 2+ Tactical Scenarios
                  </li>
                  <li className="flex items-center gap-3 text-[11px] font-bold text-muted">
                    <div className="w-3.5 h-3.5 rounded-full border border-muted/40" /> Verified Risk Budget
                  </li>
                </ul>
              </div>
              <div className="pt-2 text-center">
                 <span className="text-[10px] text-muted font-black uppercase tracking-widest italic opacity-50">Powered by Blueprint Engine™</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
