import React from "react";
import { ShieldCheck, Activity } from "lucide-react";

export const RiskView = ({ data, riskPlanName, setRiskPlanName, dailyLossLimit, setDailyLossLimit, weeklyLossLimit, setWeeklyLossLimit, maxDrawdownLimit, setMaxDrawdownLimit, riskPlanRiskPerTrade, setRiskPlanRiskPerTrade, handleSaveRiskProfile, drawdownStatus, latestDrawdown }: any) => (
  <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr] animate-in fade-in duration-500">
    <article className="panel">
      <div className="panel-heading"><div><p>Risk</p><h2>Profile Settings</h2></div><ShieldCheck size={21} /></div>
      <form className="tool-form" onSubmit={(e) => { e.preventDefault(); handleSaveRiskProfile(); }}>
        <label><span>Plan Name</span><input value={riskPlanName} onChange={e => setRiskPlanName(e.target.value)} /></label>
        <div className="form-grid-four grid gap-3"><label><span>Daily %</span><input type="number" value={dailyLossLimit} onChange={e => setDailyLossLimit(Number(e.target.value))} /></label><label><span>Weekly %</span><input type="number" value={weeklyLossLimit} onChange={e => setWeeklyLossLimit(Number(e.target.value))} /></label><label><span>Max DD %</span><input type="number" value={maxDrawdownLimit} onChange={e => setMaxDrawdownLimit(Number(e.target.value))} /></label><label><span>Risk/T %</span><input type="number" value={riskPlanRiskPerTrade} onChange={e => setRiskPlanRiskPerTrade(Number(e.target.value))} /></label></div>
        <button className="primary-button mt-2" type="submit">Save Profile</button>
      </form>
    </article>
    <article className="panel">
      <div className="panel-heading"><div><p>Compliance</p><h2>Real-time Guard</h2></div><Activity size={21} /></div>
      <div className="risk-limit"><span>Drawdown</span><strong>{latestDrawdown.toFixed(1)}%</strong></div>
      <div className="risk-limit"><span>Status</span><strong>{drawdownStatus}</strong></div>
    </article>
  </section>
);
