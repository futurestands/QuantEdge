import React from "react";
import { ShieldCheck, Activity, Target, AlertTriangle, ShieldAlert, ChevronRight, Save, Clock, Lock } from "lucide-react";

export const RiskView = ({ data, riskPlanName, setRiskPlanName, dailyLossLimit, setDailyLossLimit, weeklyLossLimit, setWeeklyLossLimit, maxDrawdownLimit, setMaxDrawdownLimit, riskPlanRiskPerTrade, setRiskPlanRiskPerTrade, handleSaveRiskProfile, drawdownStatus, latestDrawdown }: any) => {
  return (
    <div className="space-y-10 animate-in text-main max-w-[1400px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-mint" size={16} />
            <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Risk Management</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Safety Protocol Settings</h1>
          <p className="text-muted text-sm font-medium mt-1">Configure institutional guardrails and capital preservation parameters.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
           <Lock size={14} className="text-mint" />
           <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Compliance Engine active</span>
        </div>
      </header>

      <section className="grid gap-10 xl:grid-cols-12">
        <article className="panel xl:col-span-8 p-10">
          <div className="panel-heading mb-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-mint/10 border border-mint/20 flex items-center justify-center text-mint">
                  <ShieldAlert size={24} />
               </div>
               <div>
                  <p>Configuration</p>
                  <h2>Institutional Risk Profile</h2>
               </div>
            </div>
          </div>

          <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); handleSaveRiskProfile(); }}>
            <div className="tool-form">
               <label>
                  <span>Protocol Designation (Plan Name)</span>
                  <input
                    value={riskPlanName}
                    onChange={e => setRiskPlanName(e.target.value)}
                    placeholder="e.g. Institutional Conservative Alpha"
                    className="h-16 text-lg font-black bg-white/5 border-white/10 rounded-2xl px-6 focus:border-mint transition-all"
                  />
               </label>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="tool-form">
                 <label>
                   <span>Daily Loss Limit</span>
                   <div className="relative">
                      <input
                        type="number"
                        value={dailyLossLimit}
                        onChange={e => setDailyLossLimit(Number(e.target.value))}
                        className="h-16 w-full font-black text-xl bg-white/5 border-white/10 rounded-2xl pl-6 pr-12"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-muted font-black text-sm">%</span>
                   </div>
                 </label>
               </div>
               <div className="tool-form">
                 <label>
                   <span>Weekly Loss Limit</span>
                   <div className="relative">
                      <input
                        type="number"
                        value={weeklyLossLimit}
                        onChange={e => setWeeklyLossLimit(Number(e.target.value))}
                        className="h-16 w-full font-black text-xl bg-white/5 border-white/10 rounded-2xl pl-6 pr-12"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-muted font-black text-sm">%</span>
                   </div>
                 </label>
               </div>
               <div className="tool-form">
                 <label>
                   <span>Max Drawdown</span>
                   <div className="relative">
                      <input
                        type="number"
                        value={maxDrawdownLimit}
                        onChange={e => setMaxDrawdownLimit(Number(e.target.value))}
                        className="h-16 w-full font-black text-xl bg-white/5 border-white/10 rounded-2xl pl-6 pr-12"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-muted font-black text-sm">%</span>
                   </div>
                 </label>
               </div>
               <div className="tool-form">
                 <label>
                   <span>Risk Per Operation</span>
                   <div className="relative">
                      <input
                        type="number"
                        value={riskPlanRiskPerTrade}
                        onChange={e => setRiskPlanRiskPerTrade(Number(e.target.value))}
                        className="h-16 w-full font-black text-xl bg-white/5 border-white/10 rounded-2xl pl-6 pr-12"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-muted font-black text-sm">%</span>
                   </div>
                 </label>
               </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-mint/20 transition-all">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo/10 flex items-center justify-center text-indigo border border-indigo/10 group-hover:scale-110 transition-transform">
                     <Target size={28} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-main tracking-tight mb-1">Execution Constraints</h3>
                     <p className="text-sm text-muted font-medium max-w-md leading-relaxed">
                        These parameters are enforced by the Execution Firewall. Violations will result in automated trading suspension.
                     </p>
                  </div>
               </div>
               <button
                 className="primary-button !h-14 px-12 rounded-2xl bg-mint-bright hover:scale-105 active:scale-100 transition-all shadow-[0_0_30px_rgba(53,208,163,0.3)] font-black uppercase tracking-widest text-[10px]"
                 type="submit"
               >
                  Update Safety Protocol <Save size={16} className="ml-3" />
               </button>
            </div>
          </form>
        </article>

        <article className="panel xl:col-span-4 p-10 flex flex-col">
          <div className="panel-heading mb-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-muted">
                  <Activity size={24} />
               </div>
               <div>
                  <p>Real-time</p>
                  <h2>Compliance Monitor</h2>
               </div>
            </div>
          </div>

          <div className="flex-1 space-y-12">
             <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <div>
                      <span className="block text-[10px] text-muted font-black uppercase tracking-widest mb-1">Capital Exposure</span>
                      <span className="text-3xl font-black text-main tabular-nums">{latestDrawdown.toFixed(2)}%</span>
                   </div>
                   <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                     drawdownStatus === 'Compliant' ? 'border-mint-bright/20 bg-mint-bright/5 text-mint-bright' : 'border-danger/20 bg-danger/5 text-danger'
                   }`}>
                      {drawdownStatus}
                   </div>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
                   <div
                     className={`h-full rounded-full transition-all duration-1000 ${
                       latestDrawdown > (maxDrawdownLimit * 0.8) ? 'bg-danger shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-mint-bright shadow-[0_0_15px_rgba(53,208,163,0.4)]'
                     }`}
                     style={{ width: `${Math.min(100, (latestDrawdown / maxDrawdownLimit) * 100)}%` }}
                   ></div>
                </div>
                <p className="text-[10px] text-muted font-bold text-center uppercase tracking-widest italic opacity-50">Limit: {maxDrawdownLimit.toFixed(1)}% Max Relative Drawdown</p>
             </div>

             <div className="grid gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <Clock size={16} className="text-muted" />
                      <span className="text-xs font-bold text-dim uppercase">Daily Limit</span>
                   </div>
                   <span className="text-sm font-black text-main">4.00%</span>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <AlertTriangle size={16} className="text-muted" />
                      <span className="text-xs font-bold text-dim uppercase">Hard Stop</span>
                   </div>
                   <span className="text-sm font-black text-danger">10.00%</span>
                </div>
             </div>

             <div className="mt-auto pt-10 border-t border-line">
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-amber/5 border border-amber/20">
                   <AlertTriangle className="text-amber shrink-0" size={20} />
                   <p className="text-xs text-amber/80 leading-relaxed font-medium">
                      Compliance Engine v2.4 monitors all active operations. Exceeding defined limits will trigger immediate liquidation protocols and account lock-down.
                   </p>
                </div>
             </div>
          </div>
        </article>
      </section>
    </div>
  );
};
