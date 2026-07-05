import type { EdgeFinderSummary } from "./edge-finder";
import type { BacktestRow, JournalRow } from "./types";

export type CoachReportDraft = {
  summary: string;
  findings: Array<{ title: string; detail: string; severity: "positive" | "neutral" | "warning" }>;
  scores: {
    discipline: number;
    execution: number;
    robustness: number;
    psychology: number;
  };
};

export function generateCoachReport(backtest: BacktestRow | null, edge: EdgeFinderSummary, journals: JournalRow[]): CoachReportDraft {
  const metrics = backtest?.metrics ?? {};
  const winRate = numberValue(metrics.win_rate);
  const profitFactor = numberValue(metrics.profit_factor);
  const maxDrawdown = numberValue(metrics.max_drawdown);
  const expectancy = numberValue(metrics.expectancy);
  const bestSession = edge.findings.find((finding) => finding.label === "Best Session");
  const weakSession = edge.findings.find((finding) => finding.label === "Weakest Session");
  const mistakeCount = journals.reduce((total, journal) => total + (journal.mistakes?.length ?? 0), 0);

  const findings: CoachReportDraft["findings"] = [
    {
      title: "Statistical Edge",
      detail: profitFactor >= 1.2
        ? `Profit factor is ${formatNumber(profitFactor)}, which suggests the current sample has a positive edge.`
        : `Profit factor is ${formatNumber(profitFactor)}, so this strategy needs more filtering or risk adjustment.`,
      severity: profitFactor >= 1.2 ? "positive" : "warning"
    },
    {
      title: "Best Condition",
      detail: bestSession ? `${bestSession.value} is currently the strongest session. ${bestSession.detail}.` : "No best session is available yet.",
      severity: "positive"
    },
    {
      title: "Weak Condition",
      detail: weakSession ? `${weakSession.value} is currently the weakest session. ${weakSession.detail}.` : "No weak session is available yet.",
      severity: "warning"
    },
    {
      title: "Behavior Review",
      detail: mistakeCount ? `${mistakeCount} journal mistake tags have been recorded. Review the most costly repeated mistakes first.` : "No recurring mistake tags have been recorded yet.",
      severity: mistakeCount ? "neutral" : "positive"
    }
  ];

  return {
    summary: buildSummary(winRate, profitFactor, maxDrawdown, expectancy, mistakeCount),
    findings,
    scores: {
      discipline: clampScore(90 - mistakeCount * 5),
      execution: clampScore(70 + profitFactor * 10 - maxDrawdown * 50),
      robustness: clampScore(60 + profitFactor * 12 + expectancy / 10),
      psychology: clampScore(85 - mistakeCount * 4)
    }
  };
}

function buildSummary(winRate: number, profitFactor: number, maxDrawdown: number, expectancy: number, mistakeCount: number) {
  return `Latest review: win rate ${formatPercent(winRate)}, profit factor ${formatNumber(profitFactor)}, expectancy ${formatCurrency(expectancy)}, max drawdown ${formatPercent(maxDrawdown)}. ${mistakeCount ? "Journal mistakes are now part of the coaching context." : "Add journal notes to improve psychology coaching."}`;
}

function numberValue(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "inf";
}

function formatPercent(value: number) {
  const normalized = Math.abs(value) <= 1 ? value : value / 100;
  return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(normalized);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

