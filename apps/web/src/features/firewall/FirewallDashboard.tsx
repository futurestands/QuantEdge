import React, { useState } from "react";
import { ShieldCheck, Zap, AlertTriangle, CheckCircle2, XCircle, ChevronRight, Lock, Target, Scale, History, Info, Clock } from "lucide-react";
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
        spread: 0,
        newsActive: false,
        openPositionsCount: data.backtestTrades.filter((t: any) => !t.payload.exit_time).length,
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
    <div className="space-y-10 animate-in text-main max-w-[1400px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-mint" size={16} />
            <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Safety Layer™</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Execution Firewall</h1>
          <p className="text-muted text-sm font-medium mt-1">Institutional-grade pre-trade validation and capital protection protocols.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
           <Lock size={14} className="text-mint" />
           <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Real-time Hard-stop Active</span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
          <article className="panel p-10">
            <div className="panel-heading mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-muted">
                    <Target size={24} />
                 </div>
                 <div>
                    <p>Validation</p>
                    <h2>Authorization Request</h2>
                 </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10 mb-10">
              <div className="space-y-6">
                <div className="tool-form">
                   <label>
                      <span>Asset Symbol</span>
                      <input
                        value={symbol}
                        onChange={e => setSymbol(e.target.value)}
                        className="h-14 font-black uppercase bg-white/5 border-white/10 rounded-xl px-4"
                      />
                   </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="tool-form">
                      <label>
                         <span>Proposed Price</span>
                         <input
                           type="number"
                           step="0.0001"
                           value={price}
                           onChange={e => setPrice(Number(e.target.value))}
                           className="h-14 font-black bg-white/5 border-white/10 rounded-xl px-4"
                         />
                      </label>
                   </div>
                   <div className="tool-form">
                      <label>
                         <span>Volume (Lots)</span>
                         <input
                           type="number"
                           step="0.01"
                           value={lotSize}
                           onChange={e => setLotSize(Number(e.target.value))}
                           className="h-14 font-black bg-white/5 border-white/10 rounded-xl px-4"
                         />
                      </label>
                   </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-indigo/5 border border-indigo/20 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-indigo/10 rotate-12">
                   <ShieldCheck size={120} />
                </div>
                <h3 className="text-[10px] font-black text-indigo uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <Info size={14} /> Confirmation Protocol
                </h3>
                <label className="flex items-center gap-4 cursor-pointer group">
                  <input type="checkbox" checked={checklist} onChange={e => setChecklist(e.target.checked)} className="hidden" />
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                    checklist ? 'bg-mint-bright border-mint-bright shadow-[0_0_15px_rgba(53,208,163,0.4)]' : 'bg-white/5 border-white/10 group-hover:border-indigo/50'
                  }`}>
                    {checklist && <CheckCircle2 size={18} className="text-ink" strokeWidth={3} />}
                  </div>
                  <div className="flex-1">
                     <span className="block text-sm font-black text-main group-hover:text-mint-bright transition-colors">I verify strategy alignment</span>
                     <span className="block text-[10px] text-muted font-medium mt-0.5">Confirming all pre-trade rules have been satisfied.</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              className="primary-button !h-16 w-full rounded-2xl text-lg font-black shadow-[0_0_40px_rgba(53,208,163,0.2)] bg-mint-bright hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
              onClick={handleValidation}
              disabled={!activePlan}
            >
              <Zap size={22} className="fill-current" /> Process Authorization Request
            </button>
          </article>

          {result && (
            <article className={`panel p-10 border-2 animate-in slide-in-from-bottom-4 ${
              result.isAuthorized ? 'border-mint-bright/30 bg-mint-bright/[0.02]' : 'border-danger/30 bg-danger/[0.02]'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                <div className="flex items-center gap-5">
                   <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl ${
                     result.isAuthorized ? 'bg-mint-bright text-ink' : 'bg-danger text-white'
                   }`}>
                      {result.isAuthorized ? <CheckCircle2 size={32} strokeWidth={3} /> : <XCircle size={32} strokeWidth={3} />}
                   </div>
                   <div>
                      <h2 className="text-3xl font-black tracking-tighter text-main">
                        Firewall {result.isAuthorized ? 'Cleared' : 'Breached'}
                      </h2>
                      <p className="text-sm font-bold text-muted uppercase tracking-widest mt-1">
                        Authorization ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                      </p>
                   </div>
                </div>

                <div className="flex items-center gap-6 px-8 py-4 bg-white/5 border border-white/5 rounded-2xl">
                   <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-muted tracking-widest mb-1">Execution Readiness</p>
                      <div className={`text-3xl font-black tabular-nums ${result.readinessScore >= 80 ? 'text-mint-bright' : 'text-danger'}`}>
                        {result.readinessScore}%
                      </div>
                   </div>
                   <div className="w-px h-10 bg-line"></div>
                   <div className="flex flex-col gap-1">
                      <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden p-0.5">
                         <div className={`h-full rounded-full ${result.readinessScore >= 80 ? 'bg-mint-bright' : 'bg-danger'}`} style={{ width: `${result.readinessScore}%` }}></div>
                      </div>
                      <span className="text-[9px] font-black text-muted uppercase">Target: 80%+</span>
                   </div>
                </div>
              </div>

              <div className="grid gap-3">
                <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2 px-2">Institutional Check Ledger</span>
                {result.checks.map((check: any) => (
                  <div key={check.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/[0.08] transition-all">
                    <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        check.status === 'PASS' ? 'bg-mint-bright/10 text-mint-bright' : 'bg-danger/10 text-danger'
                      }`}>
                        {check.status === 'PASS' ? <CheckCircle2 size={20} strokeWidth={2.5} /> : <AlertTriangle size={20} strokeWidth={2.5} />}
                      </div>
                      <div>
                        <div className="text-sm font-black text-main tracking-tight uppercase">{check.label}</div>
                        {!check.condition && check.reason && (
                          <div className="text-[10px] text-danger font-bold uppercase tracking-wide mt-0.5">{check.reason}</div>
                        )}
                      </div>
                    </div>
                    <div className={`text-[10px] font-black px-3 py-1 rounded-lg border tracking-widest ${
                      check.status === 'PASS' ? 'border-mint-bright/20 bg-mint-bright/5 text-mint-bright' : 'border-danger/20 bg-danger/5 text-danger'
                    }`}>
                      {check.status}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <article className="panel">
            <div className="panel-heading mb-8">
              <div>
                <p>Safety Protocol</p>
                <h2>Active Constraints</h2>
              </div>
              <Scale className="text-indigo" size={22} />
            </div>
            {activePlan ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                   <div className="flex items-center gap-3 text-muted">
                      <History size={16} />
                      <span className="text-xs font-bold uppercase">Daily Limit</span>
                   </div>
                   <span className="text-sm font-black text-main">{(activePlan.max_daily_loss_percent * 100).toFixed(1)}%</span>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                   <div className="flex items-center gap-3 text-muted">
                      <History size={16} />
                      <span className="text-xs font-bold uppercase">Max Exposure</span>
                   </div>
                   <span className="text-sm font-black text-main">{activePlan.max_open_positions} Assets</span>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                   <div className="flex items-center gap-3 text-muted">
                      <Clock size={16} />
                      <span className="text-xs font-bold uppercase">Authorized</span>
                   </div>
                   <span className="text-sm font-black text-mint-bright uppercase">All Sessions</span>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center space-y-4 bg-white/5 rounded-2xl border border-white/5">
                 <AlertTriangle size={24} className="text-amber mx-auto" />
                 <p className="text-xs text-muted leading-relaxed font-medium">No active trading plan detected. Firewall requires an authorized risk profile.</p>
              </div>
            )}
          </article>

          <article className="panel border-amber/20 relative overflow-hidden">
             <div className="absolute -right-8 -bottom-8 text-amber/5 -rotate-12">
                <AlertTriangle size={140} />
             </div>
             <h3 className="text-[10px] font-black text-amber uppercase tracking-[0.2em] mb-4">Regulatory Notice</h3>
             <p className="text-xs text-dim leading-relaxed font-medium relative z-10">
                Execution without firewall authorization is a breach of institutional protocol. Systematic bypassing of the Safety Layer will result in immediate performance degradation reviews by the AI Coach.
             </p>
          </article>
        </div>
      </div>
    </div>
  );
};
