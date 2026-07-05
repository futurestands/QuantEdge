import { supabase } from "./supabase";

export type TradeImportSummary = {
  rows: number;
};

type ParsedTrade = {
  symbol: string;
  side: "long" | "short";
  entry_time: string;
  exit_time: string | null;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  pnl: number | null;
  fees: number;
  session: string | null;
};

export async function importTradesFromCsv(file: File, organizationId: string): Promise<TradeImportSummary> {
  const text = await file.text();
  const trades = parseTradeCsv(text);
  if (!trades.length) {
    throw new Error("No valid trades found. Expected symbol, side, entry_time, entry_price, quantity.");
  }

  const rows = trades.map((trade) => ({
    organization_id: organizationId,
    symbol: trade.symbol,
    direction: trade.side,
    entry_time: trade.entry_time,
    exit_time: trade.exit_time,
    entry_price: trade.entry_price,
    exit_price: trade.exit_price,
    lot_size: trade.quantity,
    pnl: trade.pnl,
    fees: trade.fees,
    session: trade.session,
    import_source: "csv"
  }));

  const chunkSize = 250;
  for (let index = 0; index < rows.length; index += chunkSize) {
    const { error } = await supabase.from("trade_events").insert(rows.slice(index, index + chunkSize));
    if (error) {
      throw error;
    }
  }

  return { rows: rows.length };
}

function parseTradeCsv(text: string): ParsedTrade[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const index = {
    symbol: findHeader(headers, ["symbol", "pair", "ticker", "instrument"]),
    side: findHeader(headers, ["side", "direction", "type"]),
    entryTime: findHeader(headers, ["entrytime", "entrydate", "opentime", "opendate"]),
    exitTime: findHeader(headers, ["exittime", "exitdate", "closetime", "closedate"]),
    entryPrice: findHeader(headers, ["entryprice", "openprice", "entry"]),
    exitPrice: findHeader(headers, ["exitprice", "closeprice", "exit"]),
    quantity: findHeader(headers, ["quantity", "qty", "size", "lots", "volume"]),
    pnl: findHeader(headers, ["pnl", "profit", "pl", "netprofit"]),
    fees: findHeader(headers, ["fees", "commission", "cost"]),
    session: findHeader(headers, ["session"])
  };

  if ([index.symbol, index.side, index.entryTime, index.entryPrice, index.quantity].some((value) => value < 0)) {
    return [];
  }

  return lines.slice(1).flatMap((line) => {
    const values = splitCsvLine(line);
    const entryTime = parseDate(values[index.entryTime]);
    const exitTime = index.exitTime >= 0 ? parseDate(values[index.exitTime]) : null;
    const side = normalizeSide(values[index.side]);
    const entryPrice = Number(values[index.entryPrice]);
    const exitPrice = index.exitPrice >= 0 && values[index.exitPrice] ? Number(values[index.exitPrice]) : null;
    const quantity = Number(values[index.quantity]);
    const pnl = index.pnl >= 0 && values[index.pnl] ? Number(values[index.pnl]) : calculatePnl(side, entryPrice, exitPrice, quantity);

    if (!entryTime || !side || [entryPrice, quantity].some(Number.isNaN) || (exitPrice !== null && Number.isNaN(exitPrice))) {
      return [];
    }

    return [{
      symbol: values[index.symbol].trim().toUpperCase(),
      side,
      entry_time: entryTime,
      exit_time: exitTime,
      entry_price: entryPrice,
      exit_price: exitPrice,
      quantity,
      pnl,
      fees: index.fees >= 0 ? Number(values[index.fees] || 0) : 0,
      session: index.session >= 0 ? values[index.session] || null : null
    }];
  });
}

function normalizeSide(value: string): "long" | "short" | null {
  const normalized = value.toLowerCase().trim();
  if (["buy", "long"].includes(normalized)) return "long";
  if (["sell", "short"].includes(normalized)) return "short";
  return null;
}

function calculatePnl(side: "long" | "short" | null, entry: number, exit: number | null, quantity: number) {
  if (!side || exit === null) return null;
  return side === "long" ? (exit - entry) * quantity : (entry - exit) * quantity;
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current.trim());
  return values;
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findHeader(headers: string[], candidates: string[]) {
  return headers.findIndex((header) => candidates.includes(header));
}

