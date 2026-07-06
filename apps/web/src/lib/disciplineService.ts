import { supabase } from "./supabase";
import type { TradingPlan, TradeSession, MarketThesis, MarketScenario } from "./types";

export async function loadTradingPlans(organizationId: string): Promise<TradingPlan[]> {
  const { data, error } = await supabase
    .from("trading_plans")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as TradingPlan[];
}

export async function loadActiveSessions(organizationId: string): Promise<TradeSession[]> {
  const { data, error } = await supabase
    .from("trade_sessions")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_completed", false)
    .order("started_at", { ascending: false });

  if (error) throw error;
  return data as TradeSession[];
}

export async function createTradingPlan(input: Partial<TradingPlan>) {
  const { data, error } = await supabase.from("trading_plans").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function startTradeSession(input: Partial<TradeSession>) {
  const { data, error } = await supabase.from("trade_sessions").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function endTradeSession(id: string, updates: Partial<TradeSession>) {
  const { error } = await supabase.from("trade_sessions").update({ ...updates, is_completed: true, ended_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function loadActiveThesis(organizationId: string): Promise<MarketThesis[]> {
  const { data, error } = await supabase
    .from("blueprints")
    .select("*, scenarios:blueprint_scenarios(*)")
    .eq("organization_id", organizationId)
    .eq("is_locked", false)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data as any[];
}

export async function createMarketThesis(input: Partial<MarketThesis>) {
  const { data, error } = await supabase.from("blueprints").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function createScenario(input: Partial<MarketScenario>) {
  const { error } = await supabase.from("blueprint_scenarios").insert(input);
  if (error) throw error;
}

export async function updateThesisScore(id: string, score: number) {
  const { error } = await supabase.from("blueprints").update({ preparation_score: score }).eq("id", id);
  if (error) throw error;
}
