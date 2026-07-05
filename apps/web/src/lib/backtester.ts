import type { BacktestCandle, BacktestResult, StrategyRow } from "./types";

import { supabase } from "./supabase";

const backtesterUrl = import.meta.env.VITE_BACKTESTER_URL || "http://localhost:8080";

async function getBacktesterHeaders(): Promise<HeadersInit> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }

  const token = data.session?.access_token;
  if (!token) {
    throw new Error("Sign in before running backtests.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export async function runDemoBacktest(): Promise<BacktestResult> {
  return runBacktest({
    strategy: {
      name: "EMA Pullback",
      initial_balance: 10000,
      risk_per_trade: 0.01,
      rules: {
        entry: "ema_fast > ema_slow and rsi < 65",
        exit: "ema_fast < ema_slow",
        stop_loss_atr: 1.5,
        take_profit_rr: 2,
        ema_fast: 8,
        ema_slow: 21,
        rsi_period: 14
      }
    },
    candles: buildDemoCandles()
  });
}

export async function runSavedStrategyBacktest(strategy: StrategyRow, candles: BacktestCandle[]): Promise<BacktestResult> {
  if (candles.length < 100) {
    throw new Error("At least 100 candles are required for a meaningful backtest.");
  }

  const rules = strategy.rules ?? {};
  const parameters = strategy.parameters ?? {};

  return runBacktest({
    strategy: {
      name: strategy.name,
      initial_balance: numeric(parameters.initial_balance, 10000),
      risk_per_trade: numeric(parameters.risk_per_trade, 0.01),
      rules: {
        entry: stringValue(rules.entry, "ema_fast > ema_slow"),
        exit: stringValue(rules.exit, "ema_fast < ema_slow"),
        stop_loss_atr: numeric(rules.stop_loss_atr, 1.5),
        take_profit_rr: numeric(rules.take_profit_rr, 2),
        ema_fast: numeric(rules.ema_fast, 20),
        ema_slow: numeric(rules.ema_slow, 50),
        rsi_period: numeric(rules.rsi_period, 14),
        sma_fast: numeric(rules.sma_fast, 20),
        sma_slow: numeric(rules.sma_slow, 50),
        macd_fast: numeric(rules.macd_fast, 12),
        macd_slow: numeric(rules.macd_slow, 26),
        macd_signal: numeric(rules.macd_signal, 9),
        bb_period: numeric(rules.bb_period, 20),
        bb_std: numeric(rules.bb_std, 2),
        direction: stringValue(rules.direction, "long"),
        session: stringValue(rules.session, "any"),
        spread: numeric(rules.spread, 0),
        slippage: numeric(rules.slippage, 0),
        commission_per_trade: numeric(rules.commission_per_trade, 0)
      }
    },
    candles
  });
}

async function runBacktest(payload: unknown): Promise<BacktestResult> {
  const headers = await getBacktesterHeaders();
  const response = await fetch(`${backtesterUrl}/backtests/run`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Backtest service failed");
  }

  return response.json();
}

function buildDemoCandles() {
  const candles = [];
  let close = 1.08;
  const start = new Date("2026-01-01T00:00:00Z");

  for (let index = 0; index < 220; index += 1) {
    const wave = Math.sin(index / 8) * 0.002;
    const trend = index * 0.00008;
    const open = close;
    close = 1.08 + trend + wave + Math.cos(index / 5) * 0.001;
    const high = Math.max(open, close) + 0.0014;
    const low = Math.min(open, close) - 0.0014;
    const time = new Date(start.getTime() + index * 60 * 60 * 1000).toISOString();

    candles.push({ time, open, high, low, close, volume: 1000 + index * 3 });
  }

  return candles;
}

function numeric(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}
