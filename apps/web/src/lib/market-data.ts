import { supabase } from "./supabase";
import type { BacktestCandle, MarketOption } from "./types";

export type CandleImportSummary = {
  symbol: string;
  timeframe: string;
  rows: number;
};

type ParsedCandle = {
  ts: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export async function importCandlesFromCsv(file: File, symbol: string, timeframe: string, assetClass = "forex"): Promise<CandleImportSummary> {
  const text = await file.text();
  const candles = parseCandleCsv(text);
  if (!candles.length) {
    throw new Error("No valid candles found. Expected columns: time, open, high, low, close, volume.");
  }

  const symbolId = await upsertSymbol(symbol, assetClass);
  const rows = candles.map((candle) => ({
    symbol_id: symbolId,
    timeframe,
    ts: candle.ts,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume
  }));

  const chunkSize = 500;
  for (let index = 0; index < rows.length; index += chunkSize) {
    const { error } = await supabase.from("historical_candles").upsert(rows.slice(index, index + chunkSize), {
      onConflict: "symbol_id,timeframe,ts"
    });
    if (error) {
      throw error;
    }
  }

  return { symbol, timeframe, rows: rows.length };
}

export async function listImportedMarkets(): Promise<MarketOption[]> {
  const { data, error } = await supabase
    .from("historical_candles")
    .select("symbol_id, timeframe, ts, symbols(symbol, asset_class, venue)")
    .order("ts", { ascending: true })
    .limit(10000);

  if (error) {
    throw error;
  }

  const markets = new Map<string, MarketOption>();
  for (const row of data ?? []) {
    const symbol = Array.isArray(row.symbols) ? row.symbols[0] : row.symbols;
    if (!symbol) {
      continue;
    }

    const key = `${row.symbol_id}:${row.timeframe}`;
    const existing = markets.get(key);
    if (!existing) {
      markets.set(key, {
        symbolId: row.symbol_id as string,
        symbol: symbol.symbol as string,
        assetClass: symbol.asset_class as string,
        venue: symbol.venue as string | null,
        timeframe: row.timeframe as string,
        candleCount: 1,
        firstCandle: row.ts as string,
        lastCandle: row.ts as string
      });
      continue;
    }

    existing.candleCount += 1;
    existing.lastCandle = row.ts as string;
  }

  return Array.from(markets.values()).sort((a, b) => `${a.symbol}:${a.timeframe}`.localeCompare(`${b.symbol}:${b.timeframe}`));
}

export async function loadCandlesForBacktest(symbolId: string, timeframe: string, startAt: string, endAt: string): Promise<BacktestCandle[]> {
  const { data, error } = await supabase
    .from("historical_candles")
    .select("ts, open, high, low, close, volume")
    .eq("symbol_id", symbolId)
    .eq("timeframe", timeframe)
    .gte("ts", startAt)
    .lte("ts", endAt)
    .order("ts", { ascending: true })
    .limit(10000);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    time: row.ts as string,
    open: Number(row.open),
    high: Number(row.high),
    low: Number(row.low),
    close: Number(row.close),
    volume: Number(row.volume ?? 0)
  }));
}

async function upsertSymbol(symbol: string, assetClass: string): Promise<string> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const { data, error } = await supabase
    .from("symbols")
    .upsert(
      {
        asset_class: assetClass,
        venue: "manual",
        symbol: normalizedSymbol,
        description: `${normalizedSymbol} manual import`
      },
      { onConflict: "asset_class,venue,symbol" }
    )
    .select("id")
    .single();

  if (error) {
    throw error;
  }
  return data.id as string;
}

function parseCandleCsv(text: string): ParsedCandle[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0]).map((header) => normalizeHeader(header));
  const headerIndex = {
    time: findHeader(headers, ["time", "timestamp", "date", "datetime", "ts"]),
    open: findHeader(headers, ["open", "o"]),
    high: findHeader(headers, ["high", "h"]),
    low: findHeader(headers, ["low", "l"]),
    close: findHeader(headers, ["close", "c"]),
    volume: findHeader(headers, ["volume", "vol", "v"])
  };

  if ([headerIndex.time, headerIndex.open, headerIndex.high, headerIndex.low, headerIndex.close].some((value) => value < 0)) {
    return [];
  }

  return lines.slice(1).flatMap((line) => {
    const values = splitCsvLine(line);
    const time = new Date(values[headerIndex.time]);
    if (Number.isNaN(time.getTime())) {
      return [];
    }

    const candle = {
      ts: time.toISOString(),
      open: Number(values[headerIndex.open]),
      high: Number(values[headerIndex.high]),
      low: Number(values[headerIndex.low]),
      close: Number(values[headerIndex.close]),
      volume: headerIndex.volume >= 0 ? Number(values[headerIndex.volume] || 0) : 0
    };

    if ([candle.open, candle.high, candle.low, candle.close].some(Number.isNaN)) {
      return [];
    }

    return [candle];
  });
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
