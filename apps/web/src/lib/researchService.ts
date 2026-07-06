import { supabase } from "./supabase";
import { getSession } from "./authService";
import type { ResearchProject, ResearchStatus, BacktestRunConfig, BacktestResult, StrategyDraft, StrategyRow, BacktestRow, BacktestTradeRow } from "./types";

export async function createResearchProject(input: Partial<ResearchProject>) {
  const session = await getSession();
  if (!session) throw new Error("Sign in required");

  const { data, error } = await supabase.from("research_projects").insert({
    ...input,
    created_by: session.user.id,
    version: "1.0",
    status: "draft"
  }).select("id").single();

  if (error) throw error;
  return data.id;
}

export async function updateResearchStatus(id: string, status: ResearchStatus) {
  const { error } = await supabase.from("research_projects").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function saveResearchProjectNotes(id: string, notes: string) {
  const { error } = await supabase.from("research_projects").update({ notes }).eq("id", id);
  if (error) throw error;
}

export async function loadResearchProjects(organizationId: string): Promise<ResearchProject[]> {
  const { data, error } = await supabase
    .from("research_projects")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ResearchProject[];
}

export async function saveBacktestResult(config: BacktestRunConfig, result: BacktestResult) {
  const session = await getSession();
  if (!session) throw new Error("Sign in before saving backtest results.");

  const { data: backtest, error } = await supabase.from("backtests").insert({
    organization_id: config.organizationId,
    strategy_id: config.strategy.id,
    symbol: config.symbol,
    timeframe: config.timeframe,
    start_at: config.startAt,
    end_at: config.endAt,
    config: {
      source: "saved-strategy",
      strategy: config.strategy.name,
      candle_count: config.candleCount,
      ai_context: result.ai_context
    },
    metrics: result.metrics,
    status: "succeeded",
    created_by: session.user.id,
    completed_at: new Date().toISOString()
  }).select("id").single();

  if (error) throw error;

  if (result.trades.length) {
    const rows = result.trades.map((trade, index) => ({
      backtest_id: backtest.id,
      trade_index: index + 1,
      payload: trade
    }));

    const { error: tradeError } = await supabase.from("backtest_trades").insert(rows);
    if (tradeError) throw tradeError;
  }

  return backtest.id as string;
}

export async function createStrategy(organizationId: string, draft: StrategyDraft) {
  const session = await getSession();
  if (!session) throw new Error("Sign in before creating strategies.");

  const { error } = await supabase.from("strategies").insert({
    organization_id: organizationId,
    name: draft.name,
    description: "Created from the structured strategy builder.",
    language: "visual",
    rules: {
      entry: draft.entry,
      exit: draft.exit,
      ema_fast: draft.emaFast,
      ema_slow: draft.emaSlow,
      rsi_period: draft.rsiPeriod,
      rsi_max: draft.rsiMax,
      sma_fast: draft.smaFast,
      sma_slow: draft.smaSlow,
      macd_fast: draft.macdFast,
      macd_slow: draft.macdSlow,
      macd_signal: draft.macdSignal,
      bb_period: draft.bbPeriod,
      bb_std: draft.bbStd,
      stop_loss_atr: draft.stopLossAtr,
      take_profit_rr: draft.takeProfitRr,
      direction: draft.direction,
      session: draft.session,
      spread: draft.spread,
      slippage: draft.slippage,
      commission_per_trade: draft.commissionPerTrade
    },
    parameters: {
      risk_per_trade: draft.riskPerTrade,
      initial_balance: draft.initialBalance
    },
    created_by: session.user.id
  });

  if (error) throw error;
}

export async function loadStrategies(organizationId: string): Promise<StrategyRow[]> {
  const { data, error } = await supabase
    .from("strategies")
    .select("id, name, rules, parameters, language, updated_at")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as StrategyRow[];
}

export async function loadBacktests(organizationId: string): Promise<BacktestRow[]> {
  const { data, error } = await supabase
    .from("backtests")
    .select("id, strategy_id, symbol, timeframe, metrics, status, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) throw error;
  return (data ?? []) as BacktestRow[];
}

export async function loadBacktestTrades(backtestId: string): Promise<BacktestTradeRow[]> {
  const { data, error } = await supabase
    .from("backtest_trades")
    .select("id, backtest_id, trade_index, payload")
    .eq("backtest_id", backtestId)
    .order("trade_index", { ascending: true })
    .limit(200);

  if (error) throw error;
  return (data ?? []) as BacktestTradeRow[];
}
