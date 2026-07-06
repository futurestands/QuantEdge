import { supabase } from "./supabase";
import type { DisciplineScore, DisciplineGrade } from "./types";

export function calculateDisciplineGrade(score: number): DisciplineGrade {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
}

export function computeDisciplineMetrics(data: any) {
  // Logic to compute scores based on trades, journals, and firewall attempts
  const execution_score = 85; // Mock logic for now, but following architecture
  const risk_score = 90;
  const psychology_score = 75;
  const consistency_score = 80;
  const planning_score = 95;
  const overall_score = Math.round((execution_score + risk_score + psychology_score + consistency_score + planning_score) / 5);

  return {
    execution_score,
    risk_score,
    psychology_score,
    consistency_score,
    planning_score,
    overall_score,
    grade: calculateDisciplineGrade(overall_score)
  };
}

export async function saveDisciplineScore(score: Partial<DisciplineScore>) {
  const { data, error } = await supabase
    .from("discipline_scores")
    .insert(score)
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function loadDisciplineScores(organizationId: string): Promise<DisciplineScore[]> {
  const { data, error } = await supabase
    .from("discipline_scores")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DisciplineScore[];
}

export async function getLatestDisciplineScore(organizationId: string): Promise<DisciplineScore | null> {
  const { data, error } = await supabase
    .from("discipline_scores")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as DisciplineScore | null;
}
