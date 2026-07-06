-- =====================================================================
-- MIGRATION: 0008_intelligence_layer
-- PURPOSE: Persistent intelligence, discipline history, and session reviews.
-- DATE: 2024-05-25 (Merged)
-- AUTHOR: QuantEdge Senior Architect
-- =====================================================================

/*
  AFFECTED TABLES:
  - public.ai_reports
  - public.discipline_scores
  - public.session_reviews
  - public.trade_reviews
*/

-- 1. ENUMS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discipline_grade') THEN
        CREATE TYPE public.discipline_grade AS ENUM ('A+', 'A', 'B', 'C', 'D');
    END IF;
END $$;

-- 2. TABLES

/**
 * ai_reports
 * Stores generative and deterministic performance reviews.
 * Merged version preserving both Repo A and Repo B schema.
 */
CREATE TABLE IF NOT EXISTS public.ai_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    session_id UUID REFERENCES public.trade_sessions(id) ON DELETE SET NULL,
    trade_id UUID REFERENCES public.trade_events(id) ON DELETE SET NULL,
    report_type TEXT NOT NULL, -- e.g. 'backtest', 'session', 'weekly', 'trade'
    subject_type TEXT,          -- From Repo A (legacy support)
    subject_id UUID,            -- From Repo A (legacy support)
    prompt_version TEXT,        -- From Repo A
    summary TEXT,
    findings JSONB DEFAULT '[]'::jsonb NOT NULL, -- list of strengths/weaknesses/recommendations
    scores JSONB DEFAULT '{}'::jsonb NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- tokens_used, model, etc
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/**
 * discipline_scores
 * Quantitative record of a trader's adherence to rules.
 */
CREATE TABLE IF NOT EXISTS public.discipline_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.trade_sessions(id) ON DELETE SET NULL,
    execution_score INT CHECK (execution_score BETWEEN 0 AND 100),
    risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
    psychology_score INT CHECK (psychology_score BETWEEN 0 AND 100),
    consistency_score INT CHECK (consistency_score BETWEEN 0 AND 100),
    planning_score INT CHECK (planning_score BETWEEN 0 AND 100),
    overall_score INT CHECK (overall_score BETWEEN 0 AND 100),
    grade public.discipline_grade NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/**
 * session_reviews
 * Qualitative summary of a completed trading session.
 */
CREATE TABLE IF NOT EXISTS public.session_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    session_id UUID NOT NULL UNIQUE REFERENCES public.trade_sessions(id) ON DELETE CASCADE,
    summary TEXT,
    mistakes TEXT[],
    good_decisions TEXT[],
    lesson TEXT,
    confidence INT CHECK (confidence BETWEEN 0 AND 10),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/**
 * trade_reviews
 * Detailed behavioral analysis of a specific trade event.
 */
CREATE TABLE IF NOT EXISTS public.trade_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    trade_event_id UUID NOT NULL UNIQUE REFERENCES public.trade_events(id) ON DELETE CASCADE,
    review TEXT,
    emotion TEXT,
    mistake_category TEXT,
    execution_quality INT CHECK (execution_quality BETWEEN 0 AND 10),
    risk_quality INT CHECK (risk_quality BETWEEN 0 AND 10),
    discipline_quality INT CHECK (discipline_quality BETWEEN 0 AND 10),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. RLS POLICIES

ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discipline_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_reviews ENABLE ROW LEVEL SECURITY;

-- AI Reports
DROP POLICY IF EXISTS select_ai_reports ON public.ai_reports;
CREATE POLICY select_ai_reports ON public.ai_reports
    FOR SELECT USING (organization_id IN (SELECT public.get_my_organizations()));

DROP POLICY IF EXISTS manage_ai_reports ON public.ai_reports;
CREATE POLICY manage_ai_reports ON public.ai_reports
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations('analyst'))
                   OR organization_id IN (SELECT public.get_my_organizations('admin'))
                   OR organization_id IN (SELECT public.get_my_organizations('owner')));

-- Discipline Scores
DROP POLICY IF EXISTS select_discipline_scores ON public.discipline_scores;
CREATE POLICY select_discipline_scores ON public.discipline_scores
    FOR SELECT USING (organization_id IN (SELECT public.get_my_organizations()));

DROP POLICY IF EXISTS manage_discipline_scores ON public.discipline_scores;
CREATE POLICY manage_discipline_scores ON public.discipline_scores
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations('analyst'))
                   OR organization_id IN (SELECT public.get_my_organizations('admin'))
                   OR organization_id IN (SELECT public.get_my_organizations('owner')));

-- Session Reviews
DROP POLICY IF EXISTS select_session_reviews ON public.session_reviews;
CREATE POLICY select_session_reviews ON public.session_reviews
    FOR SELECT USING (organization_id IN (SELECT public.get_my_organizations()));

DROP POLICY IF EXISTS manage_session_reviews ON public.session_reviews;
CREATE POLICY manage_session_reviews ON public.session_reviews
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations('analyst'))
                   OR organization_id IN (SELECT public.get_my_organizations('admin'))
                   OR organization_id IN (SELECT public.get_my_organizations('owner')));

-- Trade Reviews
DROP POLICY IF EXISTS select_trade_reviews ON public.trade_reviews;
CREATE POLICY select_trade_reviews ON public.trade_reviews
    FOR SELECT USING (organization_id IN (SELECT public.get_my_organizations()));

DROP POLICY IF EXISTS manage_trade_reviews ON public.trade_reviews;
CREATE POLICY manage_trade_reviews ON public.trade_reviews
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations('analyst'))
                   OR organization_id IN (SELECT public.get_my_organizations('admin'))
                   OR organization_id IN (SELECT public.get_my_organizations('owner')));

-- 4. TRIGGERS

DROP TRIGGER IF EXISTS tr_ai_reports_ts ON public.ai_reports;
CREATE TRIGGER tr_ai_reports_ts BEFORE INSERT OR UPDATE ON public.ai_reports FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();

DROP TRIGGER IF EXISTS tr_discipline_scores_ts ON public.discipline_scores;
CREATE TRIGGER tr_discipline_scores_ts BEFORE INSERT OR UPDATE ON public.discipline_scores FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();

DROP TRIGGER IF EXISTS tr_session_reviews_ts ON public.session_reviews;
CREATE TRIGGER tr_session_reviews_ts BEFORE INSERT OR UPDATE ON public.session_reviews FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();

DROP TRIGGER IF EXISTS tr_trade_reviews_ts ON public.trade_reviews;
CREATE TRIGGER tr_trade_reviews_ts BEFORE INSERT OR UPDATE ON public.trade_reviews FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();
