-- =====================================================================
-- MIGRATION: 0006_blueprint_workspace
-- PURPOSE: Institutional-grade Market Thesis and Scenario Planning.
-- DATE: 2024-05-24
-- AUTHOR: QuantEdge Senior Architect
-- =====================================================================

/*
  AFFECTED TABLES:
  - public.blueprints
  - public.blueprint_scenarios
  - public.trade_sessions (Updated)
  - public.trade_events (Updated)
*/

-- 1. TABLES

/**
 * blueprints
 * The primary hypothesis record for a trading session.
 */
CREATE TABLE public.blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    trading_plan_id UUID NOT NULL REFERENCES public.trading_plans(id) ON DELETE CASCADE,

    -- Market Context
    symbol TEXT NOT NULL,
    bias TEXT, -- 'bullish', 'bearish', 'neutral'
    market_regime TEXT, -- 'trending', 'balanced', 'rotational'

    -- Institutional Structure (JSONB for flexibility)
    market_structure JSONB DEFAULT '{}'::jsonb NOT NULL, -- { swing_high, swing_low, trend }
    liquidity_map JSONB DEFAULT '{}'::jsonb NOT NULL,   -- { bsl, ssl, sweeps }
    volume_profile JSONB DEFAULT '{}'::jsonb NOT NULL,  -- { poc, vah, val }

    -- Objectives & Risk
    daily_goal TEXT,
    risk_budget_percent NUMERIC(5,4),

    -- Scoring
    preparation_score INTEGER DEFAULT 0 CHECK (preparation_score BETWEEN 0 AND 100),
    is_locked BOOLEAN DEFAULT false NOT NULL,

    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

/**
 * blueprint_scenarios
 * Tactical trade ideas within a blueprint.
 */
CREATE TABLE public.blueprint_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blueprint_id UUID NOT NULL REFERENCES public.blueprints(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- 'Scenario A', 'Scenario B'

    direction public.trade_direction NOT NULL,
    entry_zone_price NUMERIC NOT NULL,
    invalidation_price NUMERIC NOT NULL,
    target_price NUMERIC NOT NULL,

    expected_rr NUMERIC(4,2),
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 10),
    probability_percent INTEGER CHECK (probability_percent BETWEEN 0 AND 100),

    status TEXT DEFAULT 'waiting' NOT NULL, -- 'waiting', 'triggered', 'executed', 'missed'

    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. SCHEMA EVOLUTION

-- Link sessions to blueprints
ALTER TABLE public.trade_sessions ADD COLUMN blueprint_id UUID REFERENCES public.blueprints(id) ON DELETE SET NULL;

-- Link executed trades to planned scenarios
ALTER TABLE public.trade_events ADD COLUMN blueprint_scenario_id UUID REFERENCES public.blueprint_scenarios(id) ON DELETE SET NULL;

-- 3. INDEXES
CREATE INDEX idx_blueprints_org ON public.blueprints(organization_id);
CREATE INDEX idx_blueprints_plan ON public.blueprints(trading_plan_id);
CREATE INDEX idx_blueprint_scenarios_parent ON public.blueprint_scenarios(blueprint_id);

-- 4. TRIGGERS
CREATE TRIGGER tr_blueprints_ts BEFORE INSERT OR UPDATE ON public.blueprints FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();
CREATE TRIGGER tr_blueprints_audit BEFORE INSERT OR UPDATE ON public.blueprints FOR EACH ROW EXECUTE FUNCTION public.handle_user_metadata();

-- 5. RLS POLICIES
ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprint_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY manage_blueprints ON public.blueprints
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));

CREATE POLICY manage_scenarios ON public.blueprint_scenarios
    FOR ALL USING (blueprint_id IN (SELECT id FROM public.blueprints));

-- 6. COMMENTS
COMMENT ON TABLE public.blueprints IS 'High-fidelity market hypothesis and preparation ledger.';
COMMENT ON TABLE public.blueprint_scenarios IS 'Tactical branching trade ideas defined before market open.';
