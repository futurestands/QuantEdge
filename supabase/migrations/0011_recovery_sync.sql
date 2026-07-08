-- =====================================================================
-- MIGRATION: 0011_recovery_sync
-- PURPOSE: Production Recovery - Synchronize DB Schema with Application Layer.
-- DATE: 2024-07-07
-- AUTHOR: QuantEdge Recovery Mode
-- =====================================================================

-- 1. ENHANCE RESEARCH PROJECTS
-- Adding missing columns identified during forensic audit.
ALTER TABLE public.research_projects
ADD COLUMN IF NOT EXISTS market_symbol TEXT,
ADD COLUMN IF NOT EXISTS timeframe TEXT,
ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0' NOT NULL,
ADD COLUMN IF NOT EXISTS latest_backtest_id UUID REFERENCES public.backtests(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS dataset_id TEXT;

-- 2. CREATE OPTIMIZATION RUNS
-- Necessary for the Strategy Optimizer feature.
CREATE TABLE IF NOT EXISTS public.optimization_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    strategy_id UUID NOT NULL REFERENCES public.strategies(id) ON DELETE CASCADE,
    objective TEXT NOT NULL,
    search_space JSONB DEFAULT '{}'::jsonb NOT NULL,
    best_parameters JSONB,
    status TEXT DEFAULT 'queued' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_optimization_org ON public.optimization_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_research_backtest ON public.research_projects(latest_backtest_id);

-- 4. RLS POLICIES
ALTER TABLE public.optimization_runs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY manage_optimization_runs ON public.optimization_runs
        FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. TRIGGER FOR TIMESTAMPS
CREATE TRIGGER tr_optimization_runs_ts BEFORE INSERT OR UPDATE ON public.optimization_runs FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();

-- 6. COMMENTS
COMMENT ON TABLE public.optimization_runs IS 'Queue and results for the Strategy Parameter Optimizer.';
COMMENT ON COLUMN public.research_projects.market_symbol IS 'The primary asset symbol target for this research.';
COMMENT ON COLUMN public.research_projects.timeframe IS 'The specific market regime/timeframe for the study.';
