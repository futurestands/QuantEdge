import React, { useState } from "react";
import { ShieldCheck, Zap, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { runFirewall, logFirewallAttempt } from "../../lib/firewall";

export const FirewallDashboard = ({ data, refresh }: any) => {
  const [symbol, setSymbol] = useState("EURUSD");
  const [lotSize, setLotSize] = useState(0.1);
  const [price, setPrice] = useState(1.0850);
  const [checklist, setChecklist] = useState(false);
  const [result, setResult] = useState<any>(null);

  const activePlan = data.tradingPlans?.find((p: any) => p.is_active);
  const activeThesis = data.activeThesis;
  const activeSession = data.activeSession;

  const handleValidation = async () => {
    if (!activePlan) return;

    const context: any = {
      plan: activePlan,
      thesis: activeThesis,
      session: activeSession,
      proposedTrade: {
        symbol,
        direction: "long",
        price,
        lotSize,
        scenarioId: activeThesis?.scenarios?.[0]?.id,
        checklistCompleted: checklist
      },
      liveData: {
        spread: 0.0002,
        newsActive: false,
        openPositionsCount: 0,
        currentDailyLoss: 0
      }
    };

    const firewallResult = runFirewall(context);
    setResult(firewallResult);

    if (data.organization?.id) {
      await logFirewallAttempt(data.organization.id, firewallResult, context);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px] animate-in fade-in duration-500">
      <div className="space-y-6">
        <article className="panel">
          <div className="panel-heading"><div><p>Execution Control</p><h2>Pre-Trade Gateway</h2></div><ShieldCheck size={21} className="text-mint" /></div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <label className="tool-form"><span>Asset Symbol</span><input value={symbol} onChange={e => setSymbol(e.target.value)} /></label>
              <label className="tool-form"><span>Proposed Price</span><input type="number" step="0.0001" value={price} onChange={e => setPrice(Number(e.target.value))} /></label>
              <label className="tool-form"><span>Lot Size</span><input type="number" step="0.01" value={lotSize} onChange={e => setLotSize(Number(e.target.value))} /></label>
            </div>
            <div className="flex flex-col justify-center p-6 rounded-2xl bg-ink border border-line">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><CheckCircle2 size={16} className="text-slate-500" /> Mandatory Checklist</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={checklist} onChange={e => setChecklist(e.target.checked)} className="hidden" />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checklist ? 'bg-mint border-mint' : 'border-line group-hover:border-slate-500'}`}>
                    {checklist && <CheckCircle2 size={12} className="text-ink" />}
                  </div>
                  <span className="text-xs text-slate-300">Rules of engagement confirmed</span>
                </label>
              </div>
            </div>
          </div>

          <button className="primary-button full-button h-16 text-lg" onClick={handleValidation} disabled={!activePlan}>
            <Zap size={20} /> Authorize Execution
          </button>
        </article>

        {result && (
          <article className={`panel border-2 ${result.isAuthorized ? 'border-mint/30' : 'border-rose-500/30'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                {result.isAuthorized ? <CheckCircle2 className="text-mint" /> : <XCircle className="text-rose-500" />}
                Firewall {result.isAuthorized ? 'CLEARED' : 'BREACHED'}
              </h2>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-500">Readiness Score</p>
                <div className={`text-2xl font-bold ${result.readinessScore >= 80 ? 'text-mint' : 'text-rose-500'}`}>{result.readinessScore}%</div>
              </div>
            </div>

            <div className="space-y-2">
              {result.checks.map((check: any) => (
                <div key={check.id} className="p-3 rounded-lg bg-ink border border-line flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {check.status === 'PASS' ? <CheckCircle2 size={16} className="text-mint" /> : <AlertTriangle size={16} className="text-rose-500" />}
                    <div>
                      <div className="text-xs font-bold text-white">{check.label}</div>
                      {!check.condition && check.reason && <div className="text-[10px] text-rose-400">{check.reason}</div>}
                    </div>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${check.status === 'PASS' ? 'bg-mint/10 text-mint' : 'bg-rose-500/10 text-rose-500'}`}>{check.status}</div>
                </div>
              ))}
            </div>
          </article>
        )}
      </div>

      <div className="space-y-6">
        <article className="panel">
          <div className="panel-heading"><div><p>Discipline</p><h2>Live Constraints</h2></div><ShieldCheck size={18} className="text-slate-500" /></div>
          {activePlan ? (
            <div className="space-y-4">
              <div className="risk-limit"><span>Daily Loss Limit</span><strong>{activePlan.max_daily_loss_percent * 100}%</strong></div>
              <div className="risk-limit"><span>Max Open Trades</span><strong>{activePlan.max_open_positions}</strong></div>
              <div className="risk-limit"><span>Allowed Sessions</span><strong>ALL</strong></div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No active trading plan detected.</p>
          )}
        </article>
      </div>
    </div>
  );
};
