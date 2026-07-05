export const formatMetric = (value: unknown) => {
  const number = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(number);
};

export const formatPercentValue = (value: number) => {
  const v = Math.abs(value) <= 1 ? value : value / 100;
  return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(v);
};

export const formatShortDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const toDateInputValue = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
};

export const buildEquityFromTrades = (trades: any[]) => {
  let equity = 10000;
  return [{ index: 0, value: 10000, drawdown: 0 }, ...trades.map((t, i) => {
    equity += Number(t.pnl || 0);
    return { index: i + 1, value: Math.round(equity), drawdown: 0 };
  })];
};

export const calculateResearchScore = (m: any) => {
  let score = 50;
  if (m.win_rate > 0.5) score += 20;
  if (m.profit_factor > 1.5) score += 15;
  if (m.expectancy > 0) score += 15;
  return Math.min(100, score);
};

export const calculateReadinessScore = (m: any) => {
  let score = 40;
  if (m.trade_count > 100) score += 30;
  if (m.max_drawdown < 0.1) score += 30;
  return Math.min(100, score);
};

export const exportToCsv = (filename: string, rows: any[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map(row => headers.map(header => JSON.stringify(row[header])).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
