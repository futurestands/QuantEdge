-- =====================================================================
-- MIGRATION: 0009_live_trading
-- PURPOSE: Infrastructure for live trade execution, risk monitoring, and discipline audit.
-- DATE: 2024-05-24
-- AUTHOR: QuantEdge AI Agent
-- =====================================================================

-- 1. TYPE DEFINITIONS
DO $$ BEGIN
    CREATE TYPE public.order_type AS ENUM ('market', 'limit', 'stop', 'stop_limit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM ('pending', 'filled', 'cancelled', 'expired', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.position_status AS ENUM ('open', 'closed', 'liquidated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES

/**
 * live_accounts
 * Real-time state of broker accounts.
 */
CREATE TABLE IF NOT EXISTS public.live_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_account_id UUID NOT NULL UNIQUE REFERENCES public.broker_accounts(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    balance NUMERIC(18, 2) NOT NULL,
    equity NUMERIC(18, 2) NOT NULL,
    margin NUMERIC(18, 2) NOT NULL,
    free_margin NUMERIC(18, 2) NOT NULL,
    margin_level NUMERIC(18, 2),
    unrealized_pnl NUMERIC(18, 2) DEFAULT 0 NOT NULL,
    daily_pnl NUMERIC(18, 2) DEFAULT 0 NOT NULL,
    weekly_pnl NUMERIC(18, 2) DEFAULT 0 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/**
 * open_positions
 * Current active trades in the market.
 */
CREATE TABLE IF NOT EXISTS public.open_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    broker_account_id UUID NOT NULL REFERENCES public.broker_accounts(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL, -- Broker position ID
    symbol TEXT NOT NULL,
    direction public.trade_direction NOT NULL,
    entry_price NUMERIC NOT NULL,
    current_price NUMERIC,
    lot_size NUMERIC NOT NULL,
    stop_loss NUMERIC,
    take_profit NUMERIC,
    unrealized_pnl NUMERIC DEFAULT 0 NOT NULL,
    commission NUMERIC DEFAULT 0 NOT NULL,
    swap NUMERIC DEFAULT 0 NOT NULL,
    opened_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT unique_broker_position UNIQUE (broker_account_id, external_id)
);

/**
 * pending_orders
 * Active orders not yet filled.
 */
CREATE TABLE IF NOT EXISTS public.pending_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    broker_account_id UUID NOT NULL REFERENCES public.broker_accounts(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL, -- Broker order ID
    symbol TEXT NOT NULL,
    type public.order_type NOT NULL,
    direction public.trade_direction NOT NULL,
    limit_price NUMERIC,
    stop_price NUMERIC,
    lot_size NUMERIC NOT NULL,
    status public.order_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT unique_broker_order UNIQUE (broker_account_id, external_id)
);

/**
 * closed_positions
 * Archive of completed live trades.
 */
CREATE TABLE IF NOT EXISTS public.closed_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    broker_account_id UUID NOT NULL REFERENCES public.broker_accounts(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    direction public.trade_direction NOT NULL,
    entry_price NUMERIC NOT NULL,
    exit_price NUMERIC NOT NULL,
    lot_size NUMERIC NOT NULL,
    pnl NUMERIC NOT NULL,
    commission NUMERIC DEFAULT 0 NOT NULL,
    swap NUMERIC DEFAULT 0 NOT NULL,
    opened_at TIMESTAMPTZ NOT NULL,
    closed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/**
 * position_events
 * Audit trail for live positions.
 */
CREATE TABLE IF NOT EXISTS public.position_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_position_id TEXT NOT NULL,
    broker_account_id UUID NOT NULL REFERENCES public.broker_accounts(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb NOT NULL,
    occurred_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/**
 * risk_snapshots
 * High-frequency risk state for monitoring and alerts.
 */
CREATE TABLE IF NOT EXISTS public.risk_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    broker_account_id UUID NOT NULL REFERENCES public.broker_accounts(id) ON DELETE CASCADE,
    current_exposure NUMERIC(18, 2) NOT NULL,
    risk_percent NUMERIC(5, 4) NOT NULL,
    margin_usage_percent NUMERIC(5, 4) NOT NULL,
    open_trade_count INTEGER NOT NULL,
    daily_drawdown_percent NUMERIC(5, 4) NOT NULL,
    captured_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/**
 * discipline_events
 * Records violations detected by Discipline Guardian™.
 */
CREATE TABLE IF NOT EXISTS public.discipline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    broker_account_id UUID REFERENCES public.broker_accounts(id) ON DELETE SET NULL,
    trade_event_id UUID REFERENCES public.trade_events(id) ON DELETE SET NULL,
    violation_type TEXT NOT NULL, -- e.g., 'LATE_ENTRY', 'RISK_OVERLOAD'
    severity TEXT NOT NULL, -- 'WARNING', 'CRITICAL'
    description TEXT NOT NULL,
    context JSONB DEFAULT '{}'::jsonb NOT NULL,
    occurred_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_open_positions_org ON public.open_positions(organization_id);
CREATE INDEX IF NOT EXISTS idx_pending_orders_org ON public.pending_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_risk_snapshots_org_time ON public.risk_snapshots(organization_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_discipline_events_org ON public.discipline_events(organization_id);

-- 4. RLS POLICIES
ALTER TABLE public.live_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closed_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discipline_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY manage_live_accounts ON public.live_accounts
        FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY manage_open_positions ON public.open_positions
        FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY manage_pending_orders ON public.pending_orders
        FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY manage_closed_positions ON public.closed_positions
        FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY manage_position_events ON public.position_events
        FOR ALL USING (broker_account_id IN (SELECT id FROM public.broker_accounts WHERE organization_id IN (SELECT public.get_my_organizations())));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY manage_risk_snapshots ON public.risk_snapshots
        FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY manage_discipline_events ON public.discipline_events
        FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
