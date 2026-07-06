import React, { useState } from "react";
import { FastForward, Play, Cpu, Target, CheckCircle2, Clock } from "lucide-react";
import type { DashboardData, StrategyRow } from "../../lib/types";
import { queueOptimizationRun } from "../../lib/dashboard";

export const OptimizationView = ({ data, refresh }: { data: DashboardData; refresh: any }) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState(data.latestStrategy?.id || "");
  const [objective, setObjective] = useState("profit_factor");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQueue = async () => {
    if (!data.organization?.id || !selectedStrategyId) return;
    setIsSubmitting(true);
    try {
      await queueOptimizationRun({
        organizationId: data.organization.id,
        strategyId: selectedStrategyId,
        objective,
        searchSpace: {
          ema_fast: [8, 12, 21],
          ema_slow: [34, 50, 89],
          rsi_max: [60, 65, 70]
        }
      });
      refresh();
    } catch (e) {
      alert("Failed to queue optimization");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FastForward className="text-mint" /> Optimization Engine
          </h2>
          <p className="text-slate-500 text-sm">Hyper-parameter tuning for strategy robustness.</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p>Configuration</p>
                <h2>New Optimization Run</h2>
              </div>
              <Cpu size={21} className="text-mint" />
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <label className="tool-form">
                <span>Target Strategy</span>
                <select
                  value={selectedStrategyId}
                  onChange={e => setSelectedStrategyId(e.target.value)}
                  className="w-full bg-ink border border-line rounded px-3 py-2 text-sm"
                >
                  {data.strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              <label className="tool-form">
                <span>Objective Function</span>
                <select
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  className="w-full bg-ink border border-line rounded px-3 py-2 text-sm"
                >
                  <option value="profit_factor">Profit Factor</option>
                  <option value="sharpe_ratio">Sharpe Ratio</option>
                  <option value="net_profit">Net Profit</option>
                  <option value="expectancy">Expectancy</option>
                </select>
              </label>
            </div>
            <div className="p-4 rounded-xl bg-ink/50 border border-line mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Search Space</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-ink rounded border border-line text-center">
                  <div className="text-[10px] text-slate-500">EMA Fast</div>
                  <div className="font-mono text-xs">8, 12, 21</div>
                </div>
                <div className="p-3 bg-ink rounded border border-line text-center">
                  <div className="text-[10px] text-slate-500">EMA Slow</div>
                  <div className="font-mono text-xs">34, 50, 89</div>
                </div>
                <div className="p-3 bg-ink rounded border border-line text-center">
                  <div className="text-[10px] text-slate-500">RSI Max</div>
                  <div className="font-mono text-xs">60, 65, 70</div>
                </div>
              </div>
            </div>
            <button
              className="primary-button full-button h-12"
              onClick={handleQueue}
              disabled={isSubmitting || !selectedStrategyId}
            >
              <Play size={16} /> {isSubmitting ? "Queueing..." : "Launch Genetic Optimizer"}
            </button>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <p>History</p>
                <h2>Recent Optimization Logs</h2>
              </div>
              <Clock size={21} className="text-slate-500" />
            </div>
            <div className="space-y-3">
              {data.optimizationRuns.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-sm">No optimization runs found.</div>
              ) : (
                data.optimizationRuns.map(run => (
                  <div key={run.id} className="p-4 rounded-xl bg-panel border border-line flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${run.status === 'completed' ? 'bg-mint/10 text-mint' : 'bg-amber/10 text-amber'}`}>
                        {run.status === 'completed' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                      </div>
                      <div>
                        <div className="font-bold text-white uppercase text-xs">{run.objective.replace('_', ' ')}</div>
                        <div className="text-[10px] text-slate-500">ID: {run.id.slice(0, 8)} • {new Date(run.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    {run.best_parameters && (
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Best Param</div>
                        <div className="text-xs text-mint font-mono">{Object.entries(run.best_parameters).slice(0, 1).map(([k, v]) => `${k}:${v}`)}</div>
                      </div>
                    )}
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${run.status === 'completed' ? 'bg-mint/10 text-mint' : 'bg-amber/10 text-amber'}`}>
                      {run.status.toUpperCase()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="panel bg-mint/5 border-mint/20">
            <div className="panel-heading">
              <div>
                <p className="text-mint/80">Strategy Health</p>
                <h2 className="text-mint">Robustness Score</h2>
              </div>
              <Target className="text-mint" size={21} />
            </div>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-white">72<span className="text-slate-500 text-lg">/100</span></div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your strategy shows high sensitivity to EMA Slow parameters. Optimization is recommended to find the most stable distribution.
              </p>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-mint" style={{ width: '72%' }} />
              </div>
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <p>AI Insights</p>
                <h2>Sensitivity Analysis</h2>
              </div>
            </div>
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-ink rounded border border-line">
                <span className="text-slate-500 block mb-1">Most Sensitive</span>
                <strong className="text-rose-400">EMA Slow Period</strong>
              </div>
              <div className="p-3 bg-ink rounded border border-line">
                <span className="text-slate-500 block mb-1">Least Sensitive</span>
                <strong className="text-mint">RSI Overbought</strong>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
