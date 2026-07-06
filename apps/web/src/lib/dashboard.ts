import { supabase } from "./supabase";
import type {
  AiReport,
  BacktestResult,
  BacktestRow,
  BacktestRunConfig,
  BacktestTradeRow,
  DashboardData,
  JournalRow,
  Metric,
  OptimizationRun,
  Organization,
  RiskProfile,
  StrategyDraft,
  StrategyRow,
  TradeRow,
  MarketThesis,
  MarketScenario,
  TradingPlan,
  TradeSession,
  ResearchProject,
  ResearchStatus,
  BacktestTradePayload
} from "./types";
import type { CoachReportDraft } from "./coach";

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function loadDashboardData(): Promise<DashboardData> {
  const session = await getSession();
  if (!session) return buildEmptyDashboard("Sign in to load your Supabase trading data.");

  const organization = await loadPrimaryOrganization();
  if (!organization) return buildEmptyDashboard("Create or join an organization to unlock saved strategies.");

  const safeLoad = async <T>(loader: () => Promise<T>, fallback: T): Promise<T> => {
    try { return await loader(); } catch (e: any) {
      if (e.code === "42P01") return fallback;
      throw e;
    }
  };

  const [trades, backtests, strategies, report, riskProfile, optimizationRuns, researchProjects, tradingPlans, sessions, theses] = await Promise.all([
    safeLoad(() => loadTrades(organization.id), []),
    safeLoad(() => loadBacktests(organization.id), []),
    safeLoad(() => loadStrategies(organization.id), []),
    safeLoad(() => loadLatestAiReport(organization.id), null),
    safeLoad(() => loadRiskProfile(organization.id), null),
    safeLoad(() => loadOptimizationRuns(organization.id), []),
    safeLoad(() => loadResearchProjects(organization.id), []),
    safeLoad(() => loadTradingPlans(organization.id), []),
    safeLoad(() => loadActiveSessions(organization.id), []),
    safeLoad(() => loadActiveThesis(organization.id), [])
  ]);

  const latestBacktestId = backtests[0]?.id;
  const [backtestTrades, journals] = latestBacktestId
    ? await Promise.all([
        safeLoad(() => loadBacktestTrades(latestBacktestId), []),
        safeLoad(() => loadJournals(organization.id), [])
      ])
    : [[], []];

  return buildDashboard(organization, trades, backtests, strategies, report, backtestTrades, journals, riskProfile, optimizationRuns, researchProjects, tradingPlans, sessions[0] || null, theses[0] || null);
}

async function loadActiveThesis(organizationId: string): Promise<MarketThesis[]> {
  const { data, error } = await supabase
    .from("blueprints")
    .select("*, scenarios:blueprint_scenarios(*)")
    .eq("organization_id", organizationId)
    .eq("is_locked", false)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  return data as any[];
}

export async function createMarketThesis(input: Partial<MarketThesis>) {
  const { data, error } = await supabase.from("blueprints").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function createScenario(input: Partial<MarketScenario>) {
  const { error } = await supabase.from("blueprint_scenarios").insert(input);
  if (error) throw error;
}

async function loadTradingPlans(organizationId: string): Promise<TradingPlan[]> {
  const { data, error } = await supabase
    .from("trading_plans")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as TradingPlan[];
}

async function loadActiveSessions(organizationId: string): Promise<TradeSession[]> {
  const { data, error } = await supabase
    .from("trade_sessions")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_completed", false)
    .order("started_at", { ascending: false });
  if (error) throw error;
  return data as TradeSession[];
}

export async function createTradingPlan(input: Partial<TradingPlan>) {
  const { data, error } = await supabase.from("trading_plans").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function startTradeSession(input: Partial<TradeSession>) {
  const { data, error } = await supabase.from("trade_sessions").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function endTradeSession(id: string, updates: Partial<TradeSession>) {
  const { error } = await supabase.from("trade_sessions").update({ ...updates, is_completed: true, ended_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

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

async function loadResearchProjects(organizationId: string): Promise<ResearchProject[]> {
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
      organization_id: config.organizationId,
      backtest_id: backtest.id,
      trade_index: index + 1,
      payload: trade,
      direction: trade.side,
      symbol: config.symbol,
      entry_price: trade.entry_price,
      exit_price: trade.exit_price,
      pnl: trade.pnl,
      lot_size: trade.quantity,
      status: 'closed'
    }));
    await supabase.from("trade_events").insert(rows);
  }
  return backtest.id as string;
}

export async function createStrategy(organizationId: string, draft: StrategyDraft) {
  const session = await getSession();
  if (!session) throw new Error("Sign in before creating strategies.");
  const { error } = await supabase.from("strategies").insert({
    organization_id: organizationId,
    name: draft.name,
    description: "Created from builder.",
    language: "visual",
    rules: {
      entry: draft.entry, exit: draft.exit, ema_fast: draft.emaFast, ema_slow: draft.emaSlow,
      rsi_period: draft.rsiPeriod, rsi_max: draft.rsiMax, sma_fast: draft.smaFast, sma_slow: draft.smaSlow,
      macd_fast: draft.macdFast, macd_slow: draft.macdSlow, macd_signal: draft.macdSignal,
      bb_period: draft.bbPeriod, bb_std: draft.bbStd, stop_loss_atr: draft.stopLossAtr,
      take_profit_rr: draft.takeProfitRr, direction: draft.direction, session: draft.session,
      spread: draft.spread, slippage: draft.slippage, commission_per_trade: draft.commissionPerTrade
    },
    parameters: { risk_per_trade: draft.riskPerTrade, initial_balance: draft.initialBalance },
    created_by: session.user.id
  });
  if (error) throw error;
}

export async function saveBacktestTradeJournal(input: {
  organizationId: string; backtestTradeId: string; emotion: string; notes: string; mistakes: string[]; executionQuality: number; confidenceScore: number;
}) {
  const { error } = await supabase.from("trade_notes").insert({
    organization_id: input.organizationId,
    backtest_trade_id: input.backtestTradeId,
    emotion: input.emotion,
    content: input.notes,
    mistakes: input.mistakes,
    execution_quality: input.executionQuality,
    confidence_score: input.confidenceScore
  });
  if (error) throw error;
}

export async function saveCoachReport(input: { organizationId: string; subjectId: string | null; report: CoachReportDraft; }) {
  const { error } = await supabase.from("ai_reports").insert({
    organization_id: input.organizationId,
    report_type: "backtest_coach",
    summary: input.report.summary,
    findings: input.report.findings,
    scores: input.report.scores
  });
  if (error) throw error;
}

export async function saveRiskProfile(input: {
  organizationId: string; profileId?: string; name: string; dailyLossLimit: number; weeklyLossLimit: number; maxDrawdownLimit: number; maxLosingStreak: number; riskPerTrade: number; propFirm: string;
}) {
  const payload = {
    organization_id: input.organizationId, name: input.name, daily_loss_limit: input.dailyLossLimit,
    weekly_loss_limit: input.weeklyLossLimit, max_drawdown_limit: input.maxDrawdownLimit,
    max_losing_streak: input.maxLosingStreak, risk_per_trade: input.riskPerTrade,
    prop_firm: input.propFirm || null, updated_at: new Date().toISOString()
  };
  const query = input.profileId ? supabase.from("risk_profiles").update(payload).eq("id", input.profileId) : supabase.from("risk_profiles").insert(payload);
  const { error } = await query;
  if (error) throw error;
}

export async function createOrganization(name: string) {
  const session = await getSession();
  if (!session) throw new Error("Sign in required.");
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const { data: org, error: orgError } = await supabase.from("organizations").insert({ name, slug: `${slug}-${Math.random().toString(36).substring(2, 6)}` }).select("id").single();
  if (orgError) throw orgError;
  await supabase.from("organization_members").insert({ organization_id: org.id, user_id: session.user.id, role: "owner" });
  return org.id as string;
}

async function loadPrimaryOrganization(): Promise<Organization | null> {
  const { data, error } = await supabase.from("organization_members").select("organization_id, organizations(id, name)").limit(1).maybeSingle();
  if (error) throw error;
  const org = data?.organizations as Organization | Organization[] | undefined;
  return Array.isArray(org) ? org[0] ?? null : org ?? null;
}

async function loadTrades(organizationId: string): Promise<TradeRow[]> {
  const { data, error } = await supabase.from("trade_events").select("id, symbol, direction, entry_time, exit_time, pnl, session, strategy_version_id").eq("organization_id", organizationId).order("entry_time", { ascending: true }).limit(500);
  if (error) throw error;
  return (data ?? []).map(row => ({ ...row, side: row.direction, strategy_id: row.strategy_version_id })) as any as TradeRow[];
}

async function loadBacktests(organizationId: string): Promise<BacktestRow[]> {
  const { data, error } = await supabase.from("backtests").select("id, strategy_id, symbol, timeframe, metrics, status, created_at").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(25);
  if (error) throw error;
  return (data ?? []) as BacktestRow[];
}

async function loadBacktestTrades(backtestId: string): Promise<BacktestTradeRow[]> {
  const { data, error } = await supabase.from("trade_events").select("id, backtest_id, trade_index, payload").eq("backtest_id", backtestId).order("trade_index", { ascending: true }).limit(200);
  if (error) throw error;
  return (data ?? []) as BacktestTradeRow[];
}

async function loadJournals(organizationId: string): Promise<JournalRow[]> {
  const { data, error } = await supabase.from("trade_notes").select("id, backtest_trade_id, trade_event_id, emotion, content, mistakes, execution_quality, confidence_score, created_at").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(200);
  if (error) throw error;
  return (data ?? []).map(row => ({ ...row, notes: row.content })) as JournalRow[];
}

async function loadStrategies(organizationId: string): Promise<StrategyRow[]> {
  const { data, error } = await supabase.from("strategies").select("id, name, rules, parameters, language, updated_at").eq("organization_id", organizationId).order("updated_at", { ascending: false }).limit(20);
  if (error) throw error;
  return (data ?? []) as StrategyRow[];
}

async function loadLatestAiReport(organizationId: string): Promise<AiReport | null> {
  const { data, error } = await supabase.from("ai_reports").select("summary, findings, scores, created_at").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data as AiReport | null;
}

async function loadRiskProfile(organizationId: string): Promise<RiskProfile | null> {
  const { data, error } = await supabase.from("risk_profiles").select("id, organization_id, name, daily_loss_limit, weekly_loss_limit, max_drawdown_limit, max_losing_streak, risk_per_trade, prop_firm").eq("organization_id", organizationId).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data as RiskProfile | null;
}

async function loadOptimizationRuns(organizationId: string): Promise<OptimizationRun[]> {
  const { data, error } = await supabase.from("optimization_runs").select("id, strategy_id, objective, search_space, best_parameters, status, created_at").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return (data ?? []) as OptimizationRun[];
}

function buildDashboard(
  organization: Organization, trades: TradeRow[], backtests: BacktestRow[], strategies: StrategyRow[], report: AiReport | null,
  backtestTrades: BacktestTradeRow[], journals: JournalRow[], riskProfile: RiskProfile | null, optimizationRuns: OptimizationRun[],
  researchProjects: ResearchProject[], tradingPlans: TradingPlan[], activeSession: TradeSession | null, activeThesis: MarketThesis | null
): DashboardData {
  const latestBacktest = backtests[0];
  const metricsFromBacktest = latestBacktest?.metrics ?? {};
  const netProfit = Number(metricsFromBacktest.net_profit ?? sum(trades.map((trade) => Number(trade.pnl ?? 0))));
  const tradeCount = Number(metricsFromBacktest.trade_count ?? trades.length);
  const winRate = Number(metricsFromBacktest.win_rate ?? (trades.length ? trades.filter(t => Number(t.pnl ?? 0) > 0).length / trades.length : 0));
  const profitFactor = Number(metricsFromBacktest.profit_factor ?? 0);
  const expectancy = Number(metricsFromBacktest.expectancy ?? (tradeCount > 0 ? netProfit / tradeCount : 0));

  return {
    organization, latestStrategy: strategies[0] ?? null, latestBacktest: latestBacktest ?? null,
    metrics: [
      { label: "Net Profit", value: formatCurrency(netProfit), delta: `${tradeCount} trades`, status: "positive" },
      { label: "Win Rate", value: formatPercent(winRate), delta: `Ratio`, status: winRate >= 0.5 ? "positive" : "danger" },
      { label: "Profit Factor", value: profitFactor.toFixed(2), delta: "latest", status: profitFactor >= 1.2 ? "positive" : "neutral" },
      { label: "Expectancy", value: formatCurrency(expectancy), delta: "Per Trade", status: expectancy > 0 ? "positive" : "danger" }
    ],
    equity: buildEquityCurve(trades, netProfit),
    heatmap: buildHeatmap(trades),
    aiSummary: report?.summary ?? "Run a backtest to see AI coaching insights.",
    scores: normalizeScores(report?.scores),
    strategies, backtestTrades, journals, riskProfile, optimizationRuns, researchProjects, tradingPlans, activeSession, activeThesis
  };
}

function buildEmptyDashboard(message: string): DashboardData {
  return {
    organization: null, latestStrategy: null, latestBacktest: null,
    metrics: [{ label: "Net Profit", value: "$0", delta: "waiting", status: "neutral" }, { label: "Win Rate", value: "0%", delta: "waiting", status: "neutral" }, { label: "Profit Factor", value: "0.00", delta: "waiting", status: "neutral" }, { label: "Max Drawdown", value: "0%", delta: "waiting", status: "neutral" }],
    equity: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({ day, value: 10000 })),
    heatmap: [["London", "0R", "0%", "$0"], ["New York", "0R", "0%", "$0"], ["Asian", "0R", "0%", "$0"], ["Overlap", "0R", "0%", "$0"]],
    aiSummary: message, scores: [["Discipline", 0], ["Execution", 0], ["Robustness", 0]],
    strategies: [], backtestTrades: [], journals: [], riskProfile: null, optimizationRuns: [], researchProjects: [], tradingPlans: [], activeSession: null, activeThesis: null
  };
}

function buildEquityCurve(trades: TradeRow[], fallbackNetProfit: number) {
  if (!trades.length) {
    const step = fallbackNetProfit / 6;
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => ({ day, value: Math.round(10000 + step * index) }));
  }
  let equity = 10000;
  const buckets = new Map<string, number>();
  for (const trade of trades) {
    const day = new Date(trade.entry_time).toLocaleDateString("en-US", { weekday: "short" });
    equity += Number(trade.pnl ?? 0);
    buckets.set(day, equity);
  }
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({ day, value: Math.round(buckets.get(day) ?? equity) }));
}

function buildHeatmap(trades: TradeRow[]) {
  return ["London", "New York", "Asian", "Overlap"].map((session) => {
    const sessionTrades = trades.filter((trade) => (trade.session ?? "Unknown").toLowerCase() === session.toLowerCase());
    const pnl = sum(sessionTrades.map((trade) => Number(trade.pnl ?? 0)));
    const wins = sessionTrades.filter((trade) => Number(trade.pnl ?? 0) > 0).length;
    const winRate = sessionTrades.length ? wins / sessionTrades.length : 0;
    const averageR = sessionTrades.length ? pnl / Math.max(sessionTrades.length * 100, 1) : 0;
    return [session, `${averageR.toFixed(1)}R`, formatPercent(winRate), formatCurrency(pnl)];
  });
}

function normalizeScores(scores?: any) {
  return [["Discipline", Number(scores?.discipline ?? 0)], ["Execution", Number(scores?.execution ?? 0)], ["Robustness", Number(scores?.robustness ?? 0)]] as Array<[string, number]>;
}

function sum(values: number[]) { return values.reduce((total, value) => total + value, 0); }
function formatCurrency(v: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v); }
function formatPercent(v: number) {
  const n = Math.abs(v) <= 1 ? v : v / 100;
  return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(n);
}
