-- =====================================================================
-- MIGRATION: 0008_intelligence_layer
-- PURPOSE: AI Review Engine and Performance Metadata.
-- DATE: 2024-05-24
-- AUTHOR: QuantEdge Senior Architect
-- =====================================================================

-- 1. TABLES

/**
 * ai_reports
 * Stores generated performance analysis from LLM models.
 */
CREATE TABLE IF NOT EXISTS public.ai_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL, -- 'backtest_coach', 'trade_review', 'session_review'
    subject_type TEXT NOT NULL, -- 'backtest', 'trade', 'session'
    subject_id UUID,           -- Link to the actual entity
    prompt_version TEXT NOT NULL,
    summary TEXT NOT NULL,
    findings JSONB DEFAULT '[]'::jsonb NOT NULL,
    scores JSONB DEFAULT '{}'::jsonb NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_ai_reports_org ON public.ai_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_subject ON public.ai_reports(subject_type, subject_id);

-- 3. RLS POLICIES
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY manage_ai_reports ON public.ai_reports
        FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. COMMENTS
COMMENT ON TABLE public.ai_reports IS 'Persistent storage for AI-generated trading performance insights.';
