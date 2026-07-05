-- =====================================================================
-- MIGRATION: 0007_execution_firewall
-- PURPOSE: Deterministic pre-trade validation and capital protection ledger.
-- DATE: 2024-05-24
-- AUTHOR: QuantEdge Senior Architect
-- =====================================================================

/*
  AFFECTED TABLES:
  - public.attempted_executions
*/

-- 1. TABLES

/**
 * attempted_executions
 * Ledger of every attempt to open a trade, documenting firewall results.
 */
CREATE TABLE public.attempted_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    trading_plan_id UUID NOT NULL REFERENCES public.trading_plans(id) ON DELETE CASCADE,
    blueprint_id UUID REFERENCES public.blueprints(id) ON DELETE SET NULL,
    blueprint_scenario_id UUID REFERENCES public.blueprint_scenarios(id) ON DELETE SET NULL,

    -- Candidate Trade Details
    symbol TEXT NOT NULL,
    direction public.trade_direction NOT NULL,
    proposed_entry_price NUMERIC NOT NULL,
    proposed_lot_size NUMERIC NOT NULL,

    -- Firewall Results
    is_authorized BOOLEAN DEFAULT false NOT NULL, -- The GO / NO-GO decision
    readiness_score INTEGER NOT NULL,            -- 0-100
    capital_protection_score INTEGER NOT NULL,    -- 0-100

    -- Granular Check Results (JSONB)
    -- Stores { "rule": "daily_loss", "status": "FAIL", "reason": "Loss limit reached" }
    validation_results JSONB DEFAULT '[]'::jsonb NOT NULL,

    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- 2. INDEXES
CREATE INDEX idx_attempted_executions_org ON public.attempted_executions(organization_id);
CREATE INDEX idx_attempted_executions_user ON public.attempted_executions(created_by);

-- 3. TRIGGERS
CREATE TRIGGER tr_attempted_executions_audit BEFORE INSERT ON public.attempted_executions FOR EACH ROW EXECUTE FUNCTION public.handle_user_metadata();

-- 4. RLS POLICIES
ALTER TABLE public.attempted_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY manage_attempts ON public.attempted_executions
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));

-- 5. COMMENTS
COMMENT ON TABLE public.attempted_executions IS 'Permanent ledger of every pre-trade validation attempt.';
