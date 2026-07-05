import { supabase } from "./supabase";
import type { TradingPlan, MarketThesis, TradeSession, FirewallCheck, FirewallCheckStatus, AttemptedExecution } from "./types";

export type ValidationContext = {
  plan: TradingPlan;
  thesis: MarketThesis | null;
  session: TradeSession | null;
  proposedTrade: {
    symbol: string;
    direction: "long" | "short";
    price: number;
    lotSize: number;
    scenarioId?: string;
    checklistCompleted: boolean;
  };
  liveData: {
    spread: number;
    newsActive: boolean;
    openPositionsCount: number;
    currentDailyLoss: number;
  };
};

export function runFirewall(context: ValidationContext) {
  const checks: FirewallCheck[] = [];

  // 1. Logic Layer
  checks.push(verify(
    "Active Session",
    context.session !== null && !context.session.is_completed,
    "A trading session must be started first.",
    "logic"
  ));

  checks.push(verify(
    "Blueprint Analysis",
    context.thesis !== null && context.thesis.preparation_score >= 80,
    "Market thesis completeness is below threshold (80%).",
    "logic"
  ));

  checks.push(verify(
    "Scenario Alignment",
    context.proposedTrade.scenarioId !== undefined,
    "No tactical scenario selected from the blueprint.",
    "logic"
  ));

  checks.push(verify(
    "Checklist Integrity",
    context.proposedTrade.checklistCompleted,
    "Pre-execution checklist remains incomplete.",
    "logic"
  ));

  // 2. Risk Layer
  checks.push(verify(
    "Daily Loss Limit",
    context.liveData.currentDailyLoss < context.plan.max_daily_loss_percent,
    `Daily loss limit (${context.plan.max_daily_loss_percent * 100}%) exceeded.`,
    "risk"
  ));

  checks.push(verify(
    "Open Exposure",
    context.liveData.openPositionsCount < context.plan.max_open_positions,
    `Maximum simultaneous positions (${context.plan.max_open_positions}) reached.`,
    "risk"
  ));

  checks.push(verify(
    "Symbol Authorization",
    context.plan.allowed_symbols.length === 0 || context.plan.allowed_symbols.includes(context.proposedTrade.symbol),
    "Symbol not included in the active trading plan.",
    "risk"
  ));

  // 3. External Layer
  checks.push(verify(
    "Execution Spread",
    context.liveData.spread < 0.0005, // Hardcoded threshold for firewall demo
    "Market spread is currently outside acceptable parameters.",
    "external"
  ));

  checks.push(verify(
    "News Filter",
    !context.liveData.newsActive || context.plan.news_filter_enabled,
    "High-impact news event detected. Plan forbids execution.",
    "external"
  ));

  const failCount = checks.filter(c => c.status === 'FAIL').length;
  const warnCount = checks.filter(c => c.status === 'WARNING').length;

  const readinessScore = Math.max(0, 100 - (failCount * 25) - (warnCount * 10));
  const protectionScore = Math.max(0, 100 - (failCount * 30));

  return {
    isAuthorized: failCount === 0,
    readinessScore,
    protectionScore,
    checks
  };
}

function verify(label: string, condition: boolean, reason: string, category: FirewallCheck["category"]): FirewallCheck {
  return {
    id: label.toLowerCase().replace(/\s+/g, "_"),
    label,
    status: condition ? 'PASS' : 'FAIL',
    reason: condition ? undefined : reason,
    category
  };
}

export async function logFirewallAttempt(organizationId: string, result: ReturnType<typeof runFirewall>, context: ValidationContext) {
  const { error } = await supabase.from("attempted_executions").insert({
    organization_id: organizationId,
    trading_plan_id: context.plan.id,
    blueprint_id: context.thesis?.id,
    blueprint_scenario_id: context.proposedTrade.scenarioId,
    symbol: context.proposedTrade.symbol,
    direction: context.proposedTrade.direction,
    proposed_entry_price: context.proposedTrade.price,
    proposed_lot_size: context.proposedTrade.lotSize,
    is_authorized: result.isAuthorized,
    readiness_score: result.readinessScore,
    capital_protection_score: result.protectionScore,
    validation_results: result.checks
  });

  if (error) throw error;
}
