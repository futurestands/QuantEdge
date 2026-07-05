import React from "react";
import { PlanBuilder } from "./PlanBuilder";
import { SessionGuard } from "./SessionGuard";

export const DisciplineView = ({ data, refresh }: any) => {
  const activePlan = data.tradingPlans?.find((p: any) => p.is_active);

  return (
    <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in duration-500">
      <div className="space-y-6">
        <PlanBuilder organizationId={data.organization?.id} onPlanCreated={refresh} />
        {activePlan && (
          <article className="panel p-8 bg-mint/5 border-mint/20">
            <h3 className="text-lg font-bold mb-4">Active Plan: {activePlan.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-ink rounded-lg border border-line"><span className="text-slate-500 block mb-1">Risk/Trade</span><strong>{activePlan.risk_per_trade_percent * 100}%</strong></div>
              <div className="p-3 bg-ink rounded-lg border border-line"><span className="text-slate-500 block mb-1">Max Trades</span><strong>{activePlan.max_trades_per_day} / Day</strong></div>
            </div>
          </article>
        )}
      </div>
      <SessionGuard activeSession={data.activeSession} tradingPlan={activePlan} organizationId={data.organization?.id} onUpdate={refresh} />
    </div>
  );
};
