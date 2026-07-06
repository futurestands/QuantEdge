import { supabase } from "./supabase";
import { getSession, loadPrimaryOrganization } from "./authService";
import { loadTrades, loadBacktests, loadStrategies, loadBacktestTrades, loadResearchProjects, loadActiveThesis, loadTradingPlans, loadActiveSessions } from "./researchService";
import { loadJournals } from "./journalService";
import { loadRiskProfile } from "./riskService";
import { loadOptimizationRuns } from "./optimizationService";
import { loadAiReports } from "./aiReviewService";
import { loadDisciplineScores } from "./disciplineService";
import { loadSessionReviews, loadTradeReviews } from "./reviewService";
import type {
  DashboardData,
  Organization,
  TradeRow,
  BacktestRow,
  StrategyRow,
  BacktestTradeRow,
  JournalRow,
  RiskProfile,
  OptimizationRun,
  ResearchProject,
  TradingPlan,
  TradeSession,
  MarketThesis,
  Metric,
  AiReport,
  DisciplineScore,
  SessionReview,
  TradeReview
} from "./types";

// Re-export services to maintain backward compatibility
export * from "./authService";
export * from "./researchService";
export * from "./journalService";
export * from "./riskService";
export * from "./optimizationService";
export * from "./aiReviewService";
export * from "./disciplineService";
export * from "./reviewService";

export async function loadDashboardData(): Promise<DashboardData> {
  const session = await getSession();
  if (!session) return buildEmptyDashboard("Sign in to load your Supabase trading data.");

  const organization = await loadPrimaryOrganization();
  if (!organization) return buildEmptyDashboard("Create or join an organization to unlock saved strategies and backtests.");

  const safeLoad = async <T>(loader: () => Promise<T>, fallback: T): Promise<T> => {
    try { return await loader(); } catch (e: any) {
      if (e.code === "42P01") return fallback;
      throw e;
    }
  };

  const [trades, backtests, strategies, riskProfile, optimizationRuns, researchProjects, tradingPlans, sessions, theses, aiReports, disciplineScores, sessionReviews, tradeReviews] = await Promise.all([
    safeLoad(() => loadTrades(organization.id), []),
    safeLoad(() => loadBacktests(organization.id), []),
    safeLoad(() => loadStrategies(organization.id), []),
    safeLoad(() => loadRiskProfile(organization.id), null),
    safeLoad(() => loadOptimizationRuns(organization.id), []),
    safeLoad(() => loadResearchProjects(organization.id), []),
    safeLoad(() => loadTradingPlans(organization.id), []),
    safeLoad(() => loadActiveSessions(organization.id), []),
    safeLoad(() => loadActiveThesis(organization.id), []),
    safeLoad(() => loadAiReports(organization.id), []),
    safeLoad(() => loadDisciplineScores(organization.id), []),
    safeLoad(() => loadSessionReviews(organization.id), []),
    safeLoad(() => loadTradeReviews(organization.id), [])
  ]);

  const latestBacktestId = backtests[0]?.id;
  const backtestTrades = latestBacktestId ? await safeLoad(() => loadBacktestTrades(latestBacktestId), []) : [];
  const journals = await safeLoad(() => loadJournals(organization.id), []);

  return {
    ...buildDashboard(organization, trades, backtests, strategies, aiReports[0] || null, backtestTrades, journals, riskProfile, optimizationRuns, researchProjects, tradingPlans, sessions[0] || null, theses[0] || null),
    aiReports,
    disciplineScores,
    sessionReviews,
    tradeReviews
  };
}

function buildDashboard(
  organization: Organization,
  trades: TradeRow[],
  backtests: BacktestRow[],
  strategies: StrategyRow[],
  report: AiReport | null,
  backtestTrades: BacktestTradeRow[],
  journals: JournalRow[],
  riskProfile: RiskProfile | null,
  optimizationRuns: OptimizationRun[],
  researchProjects: ResearchProject[],
  tradingPlans: TradingPlan[],
  activeSession: TradeSession | null,
  activeThesis: MarketThesis | null
): DashboardData {
  const latestBacktest = backtests[0];
  const metricsFromBacktest = latestBacktest?.metrics ?? {};
  const netProfit = Number(metricsFromBacktest.net_profit ?? sum(trades.map((trade) => Number(trade.pnl ?? 0))));
  const tradeCount = Number(metricsFromBacktest.trade_count ?? trades.length);
  const winRate = Number(metricsFromBacktest.win_rate ?? (trades.length ? trades.filter(t => Number(t.pnl ?? 0) > 0).length / trades.length : 0));
  const profitFactor = Number(metricsFromBacktest.profit_factor ?? 0);
  const expectancy = Number(metricsFromBacktest.expectancy ?? (tradeCount > 0 ? netProfit / tradeCount : 0));

  return {
    organization,
    latestStrategy: strategies[0] ?? null,
    latestBacktest: latestBacktest ?? null,
    metrics: [
      metric("Net Profit", formatCurrency(netProfit), `${tradeCount} trades`, "positive"),
      metric("Win Rate", formatPercent(winRate), `Ratio`, winRate >= 0.5 ? "positive" : "danger"),
      metric("Profit Factor", profitFactor.toFixed(2), "latest", profitFactor >= 1.2 ? "positive" : "neutral"),
      metric("Expectancy", formatCurrency(expectancy), "Per Trade", expectancy > 0 ? "positive" : "danger")
    ],
    equity: buildEquityCurve(trades, netProfit),
    heatmap: buildHeatmap(trades),
    aiSummary: report?.summary ?? "Run a backtest and save it to generate your first AI performance review.",
    scores: normalizeScores(report?.scores),
    strategies,
    backtestTrades,
    journals,
    riskProfile,
    optimizationRuns,
    researchProjects,
    tradingPlans,
    activeSession,
    activeThesis,
    aiReports: [],
    disciplineScores: [],
    sessionReviews: [],
    tradeReviews: []
  };
}

function buildEmptyDashboard(message: string): DashboardData {
  return {
    organization: null, latestStrategy: null, latestBacktest: null,
    metrics: [metric("Net Profit", "$0", "waiting", "neutral"), metric("Win Rate", "0%", "waiting", "neutral"), metric("Profit Factor", "0.00", "waiting", "neutral"), metric("Max Drawdown", "0%", "waiting", "neutral")],
    equity: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({ day, value: 10000 })),
    heatmap: [["London", "0R", "0%", "$0"], ["New York", "0R", "0%", "$0"], ["Asian", "0R", "0%", "$0"], ["Overlap", "0R", "0%", "$0"]],
    aiSummary: message, scores: [["Trading Discipline", 0], ["Execution Quality", 0], ["Robustness", 0]],
    strategies: [], backtestTrades: [], journals: [], riskProfile: null, optimizationRuns: [], researchProjects: [], tradingPlans: [], activeSession: null, activeThesis: null,
    aiReports: [], disciplineScores: [], sessionReviews: [], tradeReviews: []
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

function normalizeScores(scores?: Record<string, unknown>) {
  return [["Trading Discipline", Number(scores?.discipline ?? scores?.discipline_score ?? 0)], ["Execution Quality", Number(scores?.execution ?? scores?.execution_score ?? 0)], ["Robustness", Number(scores?.robustness ?? scores?.robustness_score ?? 0)]] as Array<[string, number]>;
}

function metric(label: string, value: string, delta: string, status: Metric["status"]): Metric { return { label, value, delta, status }; }
function sum(values: number[]) { return values.reduce((total, value) => total + value, 0); }
function formatCurrency(v: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v); }
function formatPercent(v: number) {
  const n = Math.abs(v) <= 1 ? v : v / 100;
  return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(n);
}
