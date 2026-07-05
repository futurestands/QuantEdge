-- =====================================================================
-- MIGRATION: 0002_research_and_strategies
-- PURPOSE: Strategy Logic and Research Project management.
-- DATE: 2024-05-23
-- AUTHOR: QuantEdge Senior Architect
-- =====================================================================

/*
  AFFECTED TABLES:
  - public.strategies
  - public.strategy_versions
  - public.research_projects
  - public.research_versions
  - public.pre_trade_checklists
*/

-- 1. TYPE DEFINITIONS
CREATE TYPE public.research_status AS ENUM (
    'draft', 'running', 'completed', 'reviewed', 'optimized', 'approved', 'live_ready', 'archived'
);

-- 2. TRIGGER FUNCTIONS

/**
 * handle_strategy_versioning
 * Automatically creates a new version record when strategy rules change.
 */
CREATE OR REPLACE FUNCTION public.handle_strategy_versioning()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND (OLD.rules != NEW.rules OR OLD.parameters != NEW.parameters)) THEN
        INSERT INTO public.strategy_versions (
            strategy_id, rules, parameters, version_label, created_by
        ) VALUES (
            NEW.id, OLD.rules, OLD.parameters, 'v' || NEW.version_count, auth.uid()
        );
        NEW.version_count = NEW.version_count + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABLES

/**
 * strategies
 * Root definition of a trading algorithm.
 */
CREATE TABLE public.strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    language TEXT DEFAULT 'visual' NOT NULL,
    rules JSONB DEFAULT '{}'::jsonb NOT NULL,
    parameters JSONB DEFAULT '{}'::jsonb NOT NULL,
    version_count INTEGER DEFAULT 1 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

/**
 * strategy_versions
 * Immutable point-in-time snapshots of strategy logic.
 */
CREATE TABLE public.strategy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID NOT NULL REFERENCES public.strategies(id) ON DELETE CASCADE,
    rules JSONB NOT NULL,
    parameters JSONB NOT NULL,
    version_label TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

/**
 * research_projects
 * Collaborative containers for strategic exploration.
 */
CREATE TABLE public.research_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    status public.research_status DEFAULT 'draft' NOT NULL,
    notes TEXT,
    tags TEXT[] DEFAULT '{}'::text[] NOT NULL,
    research_score INTEGER DEFAULT 0,
    readiness_score INTEGER DEFAULT 0,
    confidence_level TEXT DEFAULT 'low',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

/**
 * pre_trade_checklists
 * Required confirmations for a specific strategy version.
 */
CREATE TABLE public.pre_trade_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_version_id UUID NOT NULL REFERENCES public.strategy_versions(id) ON DELETE CASCADE,
    items JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/**
 * backtests
 * Results from the backtesting simulation engine.
 */
CREATE TABLE public.backtests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    strategy_id UUID NOT NULL REFERENCES public.strategies(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    config JSONB DEFAULT '{}'::jsonb NOT NULL,
    metrics JSONB DEFAULT '{}'::jsonb NOT NULL,
    status TEXT DEFAULT 'queued' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id)
);

/**
 * backtest_trades
 * Individual executions within a backtest.
 */
CREATE TABLE public.backtest_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backtest_id UUID NOT NULL REFERENCES public.backtests(id) ON DELETE CASCADE,
    trade_index INTEGER NOT NULL,
    payload JSONB NOT NULL
);

-- 4. INDEXES
CREATE INDEX idx_strategies_org ON public.strategies(organization_id);
CREATE INDEX idx_research_org ON public.research_projects(organization_id);
CREATE INDEX idx_strategy_versions_parent ON public.strategy_versions(strategy_id);
CREATE INDEX idx_backtests_org ON public.backtests(organization_id);
CREATE INDEX idx_backtest_trades_parent ON public.backtest_trades(backtest_id);

-- 5. TRIGGERS
CREATE TRIGGER tr_strategies_ts BEFORE INSERT OR UPDATE ON public.strategies FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();
CREATE TRIGGER tr_strategies_audit BEFORE INSERT OR UPDATE ON public.strategies FOR EACH ROW EXECUTE FUNCTION public.handle_user_metadata();
CREATE TRIGGER tr_strategies_versioning BEFORE UPDATE ON public.strategies FOR EACH ROW EXECUTE FUNCTION public.handle_strategy_versioning();

CREATE TRIGGER tr_research_ts BEFORE INSERT OR UPDATE ON public.research_projects FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();
CREATE TRIGGER tr_research_audit BEFORE INSERT OR UPDATE ON public.research_projects FOR EACH ROW EXECUTE FUNCTION public.handle_user_metadata();

CREATE TRIGGER tr_backtests_ts BEFORE INSERT OR UPDATE ON public.backtests FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();

-- 6. RLS POLICIES
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_trade_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY manage_strategies ON public.strategies
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));

CREATE POLICY select_versions ON public.strategy_versions
    FOR SELECT USING (strategy_id IN (SELECT id FROM public.strategies));

CREATE POLICY manage_research ON public.research_projects
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));

CREATE POLICY manage_checklists ON public.pre_trade_checklists
    FOR ALL USING (strategy_version_id IN (SELECT id FROM public.strategy_versions));

CREATE POLICY manage_backtests ON public.backtests
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));

CREATE POLICY select_backtest_trades ON public.backtest_trades
    FOR SELECT USING (backtest_id IN (SELECT id FROM public.backtests));
