import { supabase } from "./supabase";
import { getSession } from "./authService";
import { loadResearchProjects, loadStrategies, loadBacktests, loadBacktestTrades } from "./researchService";
import { loadRiskProfile } from "./riskService";
import { loadTrades, loadJournals } from "./journalService";
import { loadOptimizationRuns } from "./optimizationService";
import { loadLatestAiReport } from "./reviewService";
import { loadTradingPlans, loadActiveSessions, loadActiveThesis } from "./disciplineService";
import type { DashboardData, Organization, TradeRow, Metric } from "./types";

export * from "./authService";
export * from "./researchService";
export * from "./riskService";
export * from "./journalService";
export * from "./disciplineService";
export * from "./optimizationService";
export * from "./reviewService";

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

export async function createOrganization(name: string) {
  const session = await getSession();
  if (!session) throw new Error("Sign in required.");
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const { data: org, error: orgError } = await supabase.from("organizations").insert({ name, slug: `${slug}-${Math.random().toString(36).substring(2, 6)}` }).select("id").single();
  if (orgError) throw orgError;
  const { error: memberError } = await supabase.from("organization_members").insert({ organization_id: org.id, user_id: session.user.id, role: "owner" });
  if (memberError) throw memberError;
  return org.id as string;
}

async function loadPrimaryOrganization(): Promise<Organization | null> {
  const { data, error } = await supabase.from("organization_members").select("organization_id, organizations(id, name)").limit(1).maybeSingle();
  if (error) throw error;
  const organization = data?.organizations as Organization | Organization[] | undefined;
  return Array.isArray(organization) ? organization[0] ?? null : organization ?? null;
}

function buildDashboard(organization: Organization, trades: TradeRow[], backtests: any[], strategies: any[], report: any, backtestTrades: any[], journals: any[], riskProfile: any, optimizationRuns: any[], researchProjects: any[], tradingPlans: any[], activeSession: any, activeThesis: any): DashboardData {
  const latestBacktest = backtests[0];
  const metricsFromBacktest = latestBacktest?.metrics ?? {};
  const netProfit = Number(metricsFromBacktest.net_profit ?? sum(trades.map(t => Number(t.pnl ?? 0))));
  const tradeCount = Number(metricsFromBacktest.trade_count ?? trades.length);
  const winRate = Number(metricsFromBacktest.win_rate ?? (trades.length ? trades.filter(t => Number(t.pnl ?? 0) > 0).length / trades.length : 0));
  const profitFactor = Number(metricsFromBacktest.profit_factor ?? 0);
  const expectancy = Number(metricsFromBacktest.expectancy ?? (tradeCount > 0 ? netProfit / tradeCount : 0));

  return {
    organization, latestStrategy: strategies[0] ?? null, latestBacktest: latestBacktest ?? null,
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
    strategies, backtestTrades, journals, riskProfile, optimizationRuns, researchProjects, tradingPlans, activeSession, activeThesis
  };
}

function buildEmptyDashboard(message: string): DashboardData {
  return {
    organization: null, latestStrategy: null, latestBacktest: null,
    metrics: [metric("Net Profit", "$0", "waiting", "neutral"), metric("Win Rate", "0%", "waiting", "neutral"), metric("Profit Factor", "0.00", "waiting", "neutral"), metric("Max Drawdown", "0%", "waiting", "neutral")],
    equity: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({ day, value: 10000 })),
    heatmap: [["London", "0R", "0%", "$0"], ["New York", "0R", "0%", "$0"], ["Asian", "0R", "0%", "$0"], ["Overlap", "0R", "0%", "$0"]],
    aiSummary: message, scores: [["Discipline", 0], ["Execution", 0], ["Robustness", 0]],
    strategies: [], backtestTrades: [], journals: [], riskProfile: null, optimizationRuns: [], researchProjects: [], tradingPlans: [], activeSession: null, activeThesis: null
  };
}

function buildEquityCurve(trades: TradeRow[], fallbackNetProfit: number) {
  if (!trades.length) return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({ day, value: Math.round(10000 + (fallbackNetProfit / 6) * i) }));
  let equity = 10000;
  const buckets = new Map<string, number>();
  for (const t of trades) {
    const day = new Date(t.entry_time).toLocaleDateString("en-US", { weekday: "short" });
    equity += Number(t.pnl ?? 0);
    buckets.set(day, equity);
  }
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({ day, value: Math.round(buckets.get(day) ?? equity) }));
}

function buildHeatmap(trades: TradeRow[]) {
  return ["London", "New York", "Asian", "Overlap"].map(session => {
    const sTrades = trades.filter(t => (t.session ?? "Unknown").toLowerCase() === session.toLowerCase());
    const pnl = sum(sTrades.map(t => Number(t.pnl ?? 0)));
    const wr = sTrades.length ? sTrades.filter(t => Number(t.pnl ?? 0) > 0).length / sTrades.length : 0;
    return [session, `${(sTrades.length ? pnl / Math.max(sTrades.length * 100, 1) : 0).toFixed(1)}R`, formatPercent(wr), formatCurrency(pnl)];
  });
}

function normalizeScores(s?: any) { return [["Discipline", Number(s?.discipline ?? 0)], ["Execution", Number(s?.execution ?? 0)], ["Robustness", Number(s?.robustness ?? 0)]] as any; }
function metric(label: string, value: string, delta: string, status: Metric["status"]): Metric { return { label, value, delta, status }; }
function sum(values: number[]) { return values.reduce((t, v) => t + v, 0); }
function formatCurrency(v: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v); }
function formatPercent(v: number) { return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(Math.abs(v) <= 1 ? v : v / 100); }
