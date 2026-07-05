-- =====================================================================
-- MIGRATION: 0005_trading_plans_and_sessions
-- PURPOSE: Foundation for Behavioral Intelligence and Discipline Guardian™.
-- DATE: 2024-05-23
-- AUTHOR: QuantEdge Principal Architect
-- =====================================================================

/*
  AFFECTED TABLES:
  - public.trading_plans
  - public.trade_sessions
  - public.trade_events (Updated)
  - public.attachments (Updated for screenshots/media)
*/

-- 1. TYPE DEFINITIONS
CREATE TYPE public.trading_account_type AS ENUM ('personal', 'demo', 'funded', 'prop_challenge');
CREATE TYPE public.market_session_type AS ENUM ('london', 'new_york', 'asian', 'overlap', 'all_day');
CREATE TYPE public.mood_type AS ENUM ('focused', 'calm', 'anxious', 'impatient', 'tired', 'overconfident');

-- 2. TABLES

/**
 * trading_plans
 * The ruleset/contract the trader agrees to follow.
 */
CREATE TABLE public.trading_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    broker_account_id UUID REFERENCES public.broker_accounts(id) ON DELETE SET NULL,
    strategy_version_id UUID REFERENCES public.strategy_versions(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    account_type public.trading_account_type DEFAULT 'demo' NOT NULL,

    -- Risk Rules
    risk_per_trade_percent NUMERIC(5,4) NOT NULL,
    max_daily_loss_percent NUMERIC(5,4) NOT NULL,
    max_weekly_loss_percent NUMERIC(5,4) NOT NULL,
    max_total_loss_percent NUMERIC(5,4) NOT NULL,
    max_trades_per_day INTEGER NOT NULL,
    max_open_positions INTEGER DEFAULT 1 NOT NULL,
    minimum_risk_reward NUMERIC(4,2) DEFAULT 1.0 NOT NULL,

    -- Constraint Rules
    allowed_symbols TEXT[] DEFAULT '{}'::text[] NOT NULL,
    allowed_sessions public.market_session_type[] DEFAULT '{all_day}'::public.market_session_type[] NOT NULL,
    news_filter_enabled BOOLEAN DEFAULT true NOT NULL,
    weekend_holding_allowed BOOLEAN DEFAULT false NOT NULL,
    checklist_required BOOLEAN DEFAULT true NOT NULL,

    psychology_notes TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,

    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

/**
 * trade_sessions
 * Represents a focused period of trading performance/psychology.
 */
CREATE TABLE public.trade_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    trading_plan_id UUID NOT NULL REFERENCES public.trading_plans(id) ON DELETE CASCADE,
    broker_account_id UUID REFERENCES public.broker_accounts(id) ON DELETE SET NULL,

    started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    ended_at TIMESTAMPTZ,
    market_session public.market_session_type DEFAULT 'all_day' NOT NULL,

    -- Pre-session State
    mood_before public.mood_type,
    confidence_before INTEGER CHECK (confidence_before BETWEEN 1 AND 10),
    sleep_hours NUMERIC(3,1),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),

    -- During/Post-session State
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
    focus_level INTEGER CHECK (focus_level BETWEEN 1 AND 10),
    distractions TEXT,
    trading_location TEXT,
    economic_events TEXT[] DEFAULT '{}'::text[] NOT NULL,
    notes TEXT,
    session_rating INTEGER CHECK (session_rating BETWEEN 1 AND 10),
    is_completed BOOLEAN DEFAULT false NOT NULL,

    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 3. SCHEMA EVOLUTION (Updating Existing Tables)

-- Link trade_events to the behavior pipeline
ALTER TABLE public.trade_events
ADD COLUMN trading_plan_id UUID REFERENCES public.trading_plans(id) ON DELETE SET NULL,
ADD COLUMN trade_session_id UUID REFERENCES public.trade_sessions(id) ON DELETE SET NULL,
ADD COLUMN tradingview_url TEXT,
ADD COLUMN replay_link TEXT;

-- Enhance attachments for Trading Journey visuals
ALTER TABLE public.audit_logs ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb; -- Already exists from V1 but ensuring logic

-- 4. INDEXES
CREATE INDEX idx_trading_plans_org ON public.trading_plans(organization_id);
CREATE INDEX idx_trade_sessions_org ON public.trade_sessions(organization_id);
CREATE INDEX idx_trade_sessions_plan ON public.trade_sessions(trading_plan_id);
CREATE INDEX idx_trade_events_plan ON public.trade_events(trading_plan_id);
CREATE INDEX idx_trade_events_session ON public.trade_events(trade_session_id);

-- 5. TRIGGERS
CREATE TRIGGER tr_trading_plans_ts BEFORE INSERT OR UPDATE ON public.trading_plans FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();
CREATE TRIGGER tr_trading_plans_audit BEFORE INSERT OR UPDATE ON public.trading_plans FOR EACH ROW EXECUTE FUNCTION public.handle_user_metadata();

CREATE TRIGGER tr_trade_sessions_ts BEFORE INSERT OR UPDATE ON public.trade_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();
CREATE TRIGGER tr_trade_sessions_audit BEFORE INSERT OR UPDATE ON public.trade_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_user_metadata();

-- 6. RLS POLICIES
ALTER TABLE public.trading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY manage_trading_plans ON public.trading_plans
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));

CREATE POLICY manage_trade_sessions ON public.trade_sessions
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));

-- 7. COMMENTS
COMMENT ON TABLE public.trading_plans IS 'The governing rules for a trader in a specific workspace.';
COMMENT ON TABLE public.trade_sessions IS 'Psychological and contextual data for a specific trading period.';
