import { supabase } from "./supabase";
import type { JournalRow, TradeRow } from "./types";

export async function saveBacktestTradeJournal(input: {
  organizationId: string;
  backtestTradeId: string;
  emotion: string;
  notes: string;
  mistakes: string[];
  executionQuality: number;
  confidenceScore: number;
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

export async function loadJournals(organizationId: string): Promise<JournalRow[]> {
  const { data, error } = await supabase
    .from("trade_notes")
    .select("id, backtest_trade_id, trade_event_id, emotion, content, mistakes, execution_quality, confidence_score, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;
  return (data ?? []).map(row => ({
    ...row,
    notes: row.content // Adapter for legacy JournalRow type
  })) as JournalRow[];
}

export async function loadTrades(organizationId: string): Promise<TradeRow[]> {
  const { data, error } = await supabase
    .from("trade_events")
    .select("id, symbol, direction, entry_time, exit_time, pnl, session, strategy_version_id")
    .eq("organization_id", organizationId)
    .order("entry_time", { ascending: true })
    .limit(500);

  if (error) throw error;
  return (data ?? []).map(row => ({
    ...row,
    side: row.direction,
    strategy_id: row.strategy_version_id
  })) as any as TradeRow[];
}
