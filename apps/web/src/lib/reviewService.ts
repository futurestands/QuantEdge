import { supabase } from "./supabase";
import type { SessionReview, TradeReview } from "./types";

export async function saveSessionReview(review: Partial<SessionReview>) {
  const { data, error } = await supabase
    .from("session_reviews")
    .upsert(review, { onConflict: "session_id" })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function saveTradeReview(review: Partial<TradeReview>) {
  const { data, error } = await supabase
    .from("trade_reviews")
    .upsert(review, { onConflict: "trade_event_id" })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function loadSessionReviews(organizationId: string): Promise<SessionReview[]> {
  const { data, error } = await supabase
    .from("session_reviews")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SessionReview[];
}

export async function loadTradeReviews(organizationId: string): Promise<TradeReview[]> {
  const { data, error } = await supabase
    .from("trade_reviews")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TradeReview[];
}
