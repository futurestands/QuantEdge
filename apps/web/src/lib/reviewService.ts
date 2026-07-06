import { supabase } from "./supabase";
import type { AiReport } from "./types";
import type { CoachReportDraft } from "./coach";

export async function saveCoachReport(input: {
  organizationId: string;
  subjectId: string | null;
  report: CoachReportDraft;
}) {
  const { error } = await supabase.from("ai_reports").insert({
    organization_id: input.organizationId,
    report_type: "backtest_coach",
    subject_type: "backtest",
    subject_id: input.subjectId,
    prompt_version: "deterministic-v1",
    summary: input.report.summary,
    findings: input.report.findings,
    scores: input.report.scores
  });

  if (error) throw error;
}

export async function loadLatestAiReport(organizationId: string): Promise<AiReport | null> {
  const { data, error } = await supabase
    .from("ai_reports")
    .select("summary, findings, scores, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as AiReport | null;
}
