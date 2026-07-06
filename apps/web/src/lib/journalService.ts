import { supabase } from "./supabase";
import { saveTradeReview } from "./reviewService";
import type { JournalRow } from "./types";

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

  // Persist intelligence via trade_reviews
  await saveTradeReview({
    organization_id: input.organizationId,
    trade_event_id: input.backtestTradeId,
    review: input.notes,
    emotion: input.emotion,
    mistake_category: input.mistakes[0] || "none",
    execution_quality: input.executionQuality,
    risk_quality: 9,
    discipline_quality: input.mistakes.length === 0 ? 10 : 6
  });
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
    notes: row.content
  })) as JournalRow[];
}
