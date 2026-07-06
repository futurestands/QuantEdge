import { supabase } from "./supabase";
import type { RiskProfile } from "./types";

export async function saveRiskProfile(input: {
  organizationId: string;
  profileId?: string;
  name: string;
  dailyLossLimit: number;
  weeklyLossLimit: number;
  maxDrawdownLimit: number;
  maxLosingStreak: number;
  riskPerTrade: number;
  propFirm: string;
}) {
  const payload = {
    organization_id: input.organizationId,
    name: input.name,
    daily_loss_limit: input.dailyLossLimit,
    weekly_loss_limit: input.weeklyLossLimit,
    max_drawdown_limit: input.maxDrawdownLimit,
    max_losing_streak: input.maxLosingStreak,
    risk_per_trade: input.riskPerTrade,
    prop_firm: input.propFirm || null,
    updated_at: new Date().toISOString()
  };

  const query = input.profileId
    ? supabase.from("risk_profiles").update(payload).eq("id", input.profileId)
    : supabase.from("risk_profiles").insert(payload);

  const { error } = await query;
  if (error) throw error;
}

export async function loadRiskProfile(organizationId: string): Promise<RiskProfile | null> {
  const { data, error } = await supabase
    .from("risk_profiles")
    .select("id, organization_id, name, daily_loss_limit, weekly_loss_limit, max_drawdown_limit, max_losing_streak, risk_per_trade, prop_firm")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as RiskProfile | null;
}
