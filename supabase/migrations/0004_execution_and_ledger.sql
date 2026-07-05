-- =====================================================================
-- MIGRATION: 0004_execution_and_ledger
-- PURPOSE: High-fidelity trade execution tracking and immutable history.
-- DATE: 2024-05-23
-- AUTHOR: QuantEdge Senior Architect
-- =====================================================================

/*
  AFFECTED TABLES:
  - public.trade_events
  - public.trade_event_history
  - public.trade_decisions
  - public.market_snapshots
*/

-- 1. TYPE DEFINITIONS
CREATE TYPE public.trade_direction AS ENUM ('long', 'short');
CREATE TYPE public.trade_status AS ENUM ('open', 'closed', 'cancelled', 'modified');

-- 2. TABLES

/**
 * trade_events
 * Primary record of execution. Immutability enforced by lack of UPDATE policy.
 */
CREATE TABLE public.trade_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    broker_account_id UUID REFERENCES public.broker_accounts(id) ON DELETE SET NULL,
    strategy_version_id UUID REFERENCES public.strategy_versions(id) ON DELETE SET NULL,
    research_project_id UUID REFERENCES public.research_projects(id) ON DELETE SET NULL,
    external_id TEXT, -- Broker ticket/ID
    symbol TEXT NOT NULL,
    market TEXT,
    timeframe TEXT,
    direction public.trade_direction NOT NULL,
    entry_price NUMERIC NOT NULL,
    exit_price NUMERIC,
    stop_loss NUMERIC,
    take_profit NUMERIC,
    lot_size NUMERIC NOT NULL,
    risk_percent NUMERIC,
    commission NUMERIC DEFAULT 0 NOT NULL,
    swap NUMERIC DEFAULT 0 NOT NULL,
    spread NUMERIC DEFAULT 0 NOT NULL,
    pnl NUMERIC,
    r_multiple NUMERIC,
    duration_minutes INTEGER,
    session TEXT,
    status public.trade_status DEFAULT 'open' NOT NULL,
    import_source TEXT DEFAULT 'api' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT unique_broker_trade UNIQUE (broker_account_id, external_id)
);

/**
 * trade_event_history
 * The immutable ledger for Trading Journey timeline.
 */
CREATE TABLE public.trade_event_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_event_id UUID NOT NULL REFERENCES public.trade_events(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- e.g., 'sl_modified', 'partial_close'
    payload JSONB DEFAULT '{}'::jsonb NOT NULL,
    occurred_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/**
 * trade_decisions
 * Separates reasoning/bias from execution data.
 */
CREATE TABLE public.trade_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_event_id UUID NOT NULL UNIQUE REFERENCES public.trade_events(id) ON DELETE CASCADE,
    entry_reason TEXT,
    exit_reason TEXT,
    market_bias TEXT,
    setup_type TEXT,
    confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 10),
    expected_rr NUMERIC,
    checklist_results JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/**
 * market_snapshots
 * Captures context at the moment of entry.
 */
CREATE TABLE public.market_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_event_id UUID NOT NULL UNIQUE REFERENCES public.trade_events(id) ON DELETE CASCADE,
    spread NUMERIC,
    atr NUMERIC,
    volatility_score NUMERIC,
    trend_strength NUMERIC,
    news_risk_level TEXT,
    captured_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/**
 * trade_notes
 * Narrative journals for a specific trade.
 */
CREATE TABLE public.trade_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_event_id UUID REFERENCES public.trade_events(id) ON DELETE CASCADE,
    backtest_trade_id UUID REFERENCES public.backtest_trades(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    emotion TEXT,
    mistakes TEXT[] DEFAULT '{}'::text[] NOT NULL,
    execution_quality INTEGER CHECK (execution_quality BETWEEN 1 AND 10),
    confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 10),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT one_target_required CHECK (
        (trade_event_id IS NOT NULL AND backtest_trade_id IS NULL) OR
        (trade_event_id IS NULL AND backtest_trade_id IS NOT NULL)
    )
);

-- 3. INDEXES
CREATE INDEX idx_trade_events_org ON public.trade_events(organization_id);
CREATE INDEX idx_trade_history_parent ON public.trade_event_history(trade_event_id, occurred_at ASC);
CREATE INDEX idx_trade_events_strategy ON public.trade_events(strategy_version_id);
CREATE INDEX idx_trade_notes_parent ON public.trade_notes(trade_event_id);

-- 4. TRIGGERS
CREATE TRIGGER tr_trade_events_ts BEFORE INSERT OR UPDATE ON public.trade_events FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();
CREATE TRIGGER tr_trade_notes_ts BEFORE INSERT OR UPDATE ON public.trade_notes FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();

-- 5. RLS POLICIES
ALTER TABLE public.trade_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_event_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY manage_trades ON public.trade_events
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));

CREATE POLICY select_history ON public.trade_event_history
    FOR SELECT USING (trade_event_id IN (SELECT id FROM public.trade_events));

CREATE POLICY manage_decisions ON public.trade_decisions
    FOR ALL USING (trade_event_id IN (SELECT id FROM public.trade_events));

CREATE POLICY select_market_context ON public.market_snapshots
    FOR SELECT USING (trade_event_id IN (SELECT id FROM public.trade_events));

CREATE POLICY manage_notes ON public.trade_notes
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));
