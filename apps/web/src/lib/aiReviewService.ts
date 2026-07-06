import { supabase } from "./supabase";
import type { AiReport } from "./types";

export async function saveAiReport(report: Partial<AiReport>) {
  const { data, error } = await supabase
    .from("ai_reports")
    .insert(report)
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function loadAiReports(organizationId: string): Promise<AiReport[]> {
  const { data, error } = await supabase
    .from("ai_reports")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AiReport[];
}

export async function getLatestAiReport(organizationId: string): Promise<AiReport | null> {
  const { data, error } = await supabase
    .from("ai_reports")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as AiReport | null;
}

export async function saveCoachReport(input: {
  organizationId: string;
  subjectId: string | null;
  report: any;
}) {
  return saveAiReport({
    organization_id: input.organizationId,
    report_type: "backtest_coach",
    summary: input.report.summary,
    findings: input.report.findings,
    scores: input.report.scores
  });
}
