import React, { useState } from "react";
import { ShieldCheck, Plus, Target } from "lucide-react";
import { createTradingPlan } from "../../lib/dashboard";

export const PlanBuilder = ({ organizationId, onPlanCreated }: any) => {
  const [name, setName] = useState("My Trading Plan");
  const [risk, setRisk] = useState(1);
  const [dailyLoss, setDailyLoss] = useState(3);
  const [maxTrades, setMaxTrades] = useState(3);
  const [minRr, setMinRr] = useState(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTradingPlan({
        organization_id: organizationId,
        name,
        risk_per_trade_percent: risk / 100,
        max_daily_loss_percent: dailyLoss / 100,
        max_weekly_loss_percent: (dailyLoss * 2) / 100,
        max_total_loss_percent: 0.1,
        max_trades_per_day: maxTrades,
        minimum_risk_reward: minRr,
        is_active: true
      });
      onPlanCreated();
    } catch (err) {
      alert("Failed to create plan");
    }
  };

  return (
    <article className="panel">
      <div className="panel-heading"><div><p>Discipline Guardian</p><h2>Define Trading Plan</h2></div><ShieldCheck size={21} className="text-mint" /></div>
      <form className="tool-form" onSubmit={handleSubmit}>
        <label><span>Plan Name</span><input value={name} onChange={e => setName(e.target.value)} required /></label>
        <div className="form-grid">
          <label><span>Risk per Trade (%)</span><input type="number" step="0.1" value={risk} onChange={e => setRisk(Number(e.target.value))} /></label>
          <label><span>Max Daily Loss (%)</span><input type="number" step="0.1" value={dailyLoss} onChange={e => setDailyLoss(Number(e.target.value))} /></label>
        </div>
        <div className="form-grid">
          <label><span>Max Trades/Day</span><input type="number" value={maxTrades} onChange={e => setMaxTrades(Number(e.target.value))} /></label>
          <label><span>Min Risk Reward</span><input type="number" step="0.1" value={minRr} onChange={e => setMinRr(Number(e.target.value))} /></label>
        </div>
        <button className="primary-button mt-4" type="submit"><Plus size={16} /> Activate Plan</button>
      </form>
    </article>
  );
};
