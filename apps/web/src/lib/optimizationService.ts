import { supabase } from "./supabase";
import type { OptimizationRun } from "./types";

export async function queueOptimizationRun(input: {
  organizationId: string;
  strategyId: string;
  objective: string;
  searchSpace: Record<string, unknown>;
}) {
  const { error } = await supabase.from("optimization_runs").insert({
    organization_id: input.organizationId,
    strategy_id: input.strategyId,
    objective: input.objective,
    search_space: input.searchSpace,
    status: "queued"
  });

  if (error) throw error;
}

export async function loadOptimizationRuns(organizationId: string): Promise<OptimizationRun[]> {
  const { data, error } = await supabase
    .from("optimization_runs")
    .select("id, strategy_id, objective, search_space, best_parameters, status, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as OptimizationRun[];
}
