import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Zap, Lock, Unlock, AlertTriangle, CheckCircle } from "lucide-react";
import { runFirewall, logFirewallAttempt } from "../../lib/firewall";
import { ScoreCard } from "../../components/ui/Metrics";

export const FirewallDashboard = ({ data, refresh }: any) => {
  const [checklist, setChecklist] = useState(false);
  const [symbol, setSymbol] = useState(data.activeThesis?.symbol || "EURUSD");
  const [direction, setDirection] = useState<"long" | "short">("long");

  const activePlan = data.tradingPlans?.find((p: any) => p.is_active);

  const firewallResult = runFirewall({
    plan: activePlan,
    thesis: data.activeThesis,
    session: data.activeSession,
    proposedTrade: {
      symbol,
      direction,
      price: 1.0850, // Simulated entry
      lotSize: 1.0,
      scenarioId: data.activeThesis?.scenarios?.[0]?.id,
      checklistCompleted: checklist
    },
    liveData: {
      spread: 0.0001,
      newsActive: false,
      openPositionsCount: 0,
      currentDailyLoss: 0
    }
  });

  const handleExecute = async () => {
    await logFirewallAttempt(data.organization.id, firewallResult, {
        plan: activePlan,
        thesis: data.activeThesis,
        session: data.activeSession,
        proposedTrade: { symbol, direction, price: 1.0850, lotSize: 1.0, scenarioId: data.activeThesis?.scenarios?.[0]?.id, checklistCompleted: checklist },
        liveData: { spread: 0.0001, newsActive: false, openPositionsCount: 0, currentDailyLoss: 0 }
    });
    if (firewallResult.isAuthorized) {
        alert("Execution Signal Sent to Broker Node");
    }
    refresh();
  };

  if (!activePlan) return <div className="panel p-20 text-center text-slate-500">Enable a Trading Plan to initialize the Firewall.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${firewallResult.isAuthorized ? "bg-mint shadow-[0_0_15px_#35d0a3]" : "bg-red-500 shadow-[0_0_15px_red]"}`} />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">System Status: {firewallResult.isAuthorized ? "GO" : "NO-GO"}</span>
           </div>
           <h1 className="text-4xl font-bold tracking-tighter">Execution Firewall™</h1>
        </div>
        <div className="flex gap-4">
           <ScoreCard label="Capital Protection" score={firewallResult.protectionScore} color="text-mint" />
           <ScoreCard label="Operational Readiness" score={firewallResult.readinessScore} color="text-mint" />
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_450px] gap-8">
        <section className="space-y-8">
           <article className="panel p-8 bg-gradient-to-br from-panel to-ink">
              <div className="panel-heading mb-8"><div><p>Checklist</p><h2>Pilot Verifications</h2></div><ShieldCheck className="text-mint" /></div>
              <div className="grid gap-4">
                 {firewallResult.checks.map(check => (
                   <div key={check.id} className="flex items-center justify-between p-5 panel bg-ink/40 border-line/40">
                      <div className="flex items-center gap-4">
                         {check.status === 'PASS' ? <CheckCircle className="text-mint" size={20} /> : <AlertTriangle className="text-red-500" size={20} />}
                         <div>
                            <strong className="block text-sm">{check.label}</strong>
                            {check.reason && <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">{check.reason}</p>}
                         </div>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded border ${check.status === 'PASS' ? 'border-mint text-mint' : 'border-red-500 text-red-500'}`}>{check.status}</span>
                   </div>
                 ))}
              </div>
           </article>
        </section>

        <aside className="space-y-8">
           <article className="panel p-8 space-y-6">
              <h3 className="font-bold uppercase tracking-widest text-xs text-slate-500">Execution Controls</h3>
              <label className="tool-form"><span>Target Symbol</span><input value={symbol} onChange={e => setSymbol(e.target.value)} /></label>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setDirection('long')} className={`p-4 panel text-xs font-bold uppercase transition-all ${direction === 'long' ? 'border-mint bg-mint/5 text-white' : 'text-slate-500'}`}>Long</button>
                 <button onClick={() => setDirection('short')} className={`p-4 panel text-xs font-bold uppercase transition-all ${direction === 'short' ? 'border-red-500 bg-red-500/5 text-white' : 'text-slate-500'}`}>Short</button>
              </div>
              <button
                onClick={() => setChecklist(!checklist)}
                className={`w-full p-4 panel flex items-center justify-between transition-all ${checklist ? 'border-mint text-mint' : 'text-slate-500'}`}
              >
                <span className="text-xs font-bold uppercase">Checklist Completed</span>
                {checklist ? <CheckCircle size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-700" />}
              </button>

              <button
                disabled={!firewallResult.isAuthorized}
                onClick={handleExecute}
                className={`full-button h-20 text-xl font-black transition-all flex items-center justify-center gap-4 ${firewallResult.isAuthorized ? 'bg-mint text-ink shadow-[0_20px_50px_rgba(53,208,163,0.3)] hover:scale-[1.02]' : 'bg-panel border-line text-slate-700 cursor-not-allowed grayscale'}`}
              >
                {firewallResult.isAuthorized ? <Unlock size={24} /> : <Lock size={24} />}
                {firewallResult.isAuthorized ? "EXECUTE ORDER" : "EXECUTION BLOCKED"}
              </button>
           </article>
        </aside>
      </div>
    </div>
  );
};
