import type { BacktestRow, BacktestTradeRow, JournalRow } from "./types";

export type EdgeFinding = {
  label: string;
  value: string;
  detail: string;
  status: "positive" | "neutral" | "danger";
};

export type EdgeGroup = {
  label: string;
  trades: number;
  winRate: number;
  expectancy: number;
  averageR: number;
  profitFactor: number;
  netProfit: number;
};

export type EdgeFinderSummary = {
  findings: EdgeFinding[];
  sessions: EdgeGroup[];
  weekdays: EdgeGroup[];
  reasons: EdgeGroup[];
  mistakes: EdgeGroup[];
};

export function computeEdgeFinder(backtest: BacktestRow | null, trades: BacktestTradeRow[], journals: JournalRow[]): EdgeFinderSummary {
  const tradeGroups = trades.map((trade) => ({
    trade,
    pnl: Number(trade.payload.pnl ?? 0),
    r: Number(trade.payload.r_multiple ?? 0),
    entryTime: parseDate(trade.payload.entry_time),
    reason: trade.payload.reason ?? "unknown"
  }));

  const sessions = summarizeBy(
    tradeGroups,
    (item) => sessionFromDate(item.entryTime)
  );
  const weekdays = summarizeBy(
    tradeGroups,
    (item) => weekdayFromDate(item.entryTime)
  );
  const reasons = summarizeBy(
    tradeGroups,
    (item) => item.reason
  );
  const mistakes = summarizeMistakes(journals, trades);

  const bestSession = bestBy(sessions, "expectancy");
  const worstSession = worstBy(sessions, "expectancy");
  const bestWeekday = bestBy(weekdays, "expectancy");
  const bestReason = bestBy(reasons, "expectancy");
  const worstMistake = worstBy(mistakes, "expectancy");
  const latestSymbol = backtest ? `${backtest.symbol} ${backtest.timeframe}` : "No backtest";

  return {
    findings: [
      finding("Best Session", bestSession?.label ?? "-", bestSession ? `${formatCurrency(bestSession.netProfit)} net, ${formatPercent(bestSession.winRate)} win rate` : latestSymbol, "positive"),
      finding("Weakest Session", worstSession?.label ?? "-", worstSession ? `${formatCurrency(worstSession.netProfit)} net, ${formatR(worstSession.averageR)} avg R` : "Run a backtest first", "danger"),
      finding("Best Weekday", bestWeekday?.label ?? "-", bestWeekday ? `${formatCurrency(bestWeekday.netProfit)} net, ${bestWeekday.trades} trades` : "Waiting for trades", "positive"),
      finding("Best Exit Type", bestReason?.label ?? "-", bestReason ? `${formatR(bestReason.averageR)} avg R, PF ${formatNumber(bestReason.profitFactor)}` : "Waiting for trades", "neutral"),
      finding("Costliest Mistake", worstMistake?.label ?? "-", worstMistake ? `${formatCurrency(worstMistake.netProfit)} net impact` : "No journal mistakes yet", "danger")
    ],
    sessions,
    weekdays,
    reasons,
    mistakes
  };
}

function summarizeBy<T extends { pnl: number; r: number }>(items: T[], keyFn: (item: T) => string): EdgeGroup[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return Array.from(groups.entries())
    .map(([label, group]) => summarizeGroup(label, group.map((item) => ({ pnl: item.pnl, r: item.r }))))
    .sort((a, b) => b.expectancy - a.expectancy);
}

function summarizeMistakes(journals: JournalRow[], trades: BacktestTradeRow[]): EdgeGroup[] {
  const tradeById = new Map(trades.map((trade) => [trade.id, trade]));
  const rows: Array<{ label: string; pnl: number; r: number }> = [];

  for (const journal of journals) {
    const trade = journal.backtest_trade_id ? tradeById.get(journal.backtest_trade_id) : null;
    if (!trade) {
      continue;
    }

    for (const mistake of journal.mistakes ?? []) {
      rows.push({
        label: mistake,
        pnl: Number(trade.payload.pnl ?? 0),
        r: Number(trade.payload.r_multiple ?? 0)
      });
    }
  }

  const groups = new Map<string, Array<{ pnl: number; r: number }>>();
  for (const row of rows) {
    groups.set(row.label, [...(groups.get(row.label) ?? []), row]);
  }

  return Array.from(groups.entries())
    .map(([label, group]) => summarizeGroup(label, group))
    .sort((a, b) => a.expectancy - b.expectancy);
}

function summarizeGroup(label: string, rows: Array<{ pnl: number; r: number }>): EdgeGroup {
  const wins = rows.filter((row) => row.pnl > 0);
  const losses = rows.filter((row) => row.pnl < 0);
  const grossProfit = sum(wins.map((row) => row.pnl));
  const grossLoss = Math.abs(sum(losses.map((row) => row.pnl)));
  const netProfit = sum(rows.map((row) => row.pnl));

  return {
    label: titleize(label),
    trades: rows.length,
    winRate: rows.length ? wins.length / rows.length : 0,
    expectancy: rows.length ? netProfit / rows.length : 0,
    averageR: rows.length ? sum(rows.map((row) => row.r)) / rows.length : 0,
    profitFactor: grossLoss ? grossProfit / grossLoss : grossProfit ? Number.POSITIVE_INFINITY : 0,
    netProfit
  };
}

function bestBy(groups: EdgeGroup[], key: keyof EdgeGroup) {
  return groups.filter((group) => group.trades > 0).sort((a, b) => Number(b[key]) - Number(a[key]))[0] ?? null;
}

function worstBy(groups: EdgeGroup[], key: keyof EdgeGroup) {
  return groups.filter((group) => group.trades > 0).sort((a, b) => Number(a[key]) - Number(b[key]))[0] ?? null;
}

function sessionFromDate(date: Date | null) {
  if (!date) {
    return "unknown";
  }
  const hour = date.getUTCHours();
  if (hour >= 12 && hour < 16) return "overlap";
  if (hour >= 7 && hour < 16) return "london";
  if (hour >= 12 && hour < 21) return "new_york";
  if (hour >= 0 && hour < 8) return "asian";
  return "off_session";
}

function weekdayFromDate(date: Date | null) {
  return date ? date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }) : "unknown";
}

function parseDate(value?: string) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function finding(label: string, value: string, detail: string, status: EdgeFinding["status"]): EdgeFinding {
  return { label, value, detail, status };
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(value);
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "inf";
}

function formatR(value: number) {
  return `${formatNumber(value)}R`;
}

function titleize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

