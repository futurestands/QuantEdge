-- =====================================================================
-- MIGRATION: 0003_brokerage_and_market_data
-- PURPOSE: Infrastructure for multi-broker accounts and historical data.
-- DATE: 2024-05-23
-- AUTHOR: QuantEdge Senior Architect
-- =====================================================================

/*
  AFFECTED TABLES:
  - public.broker_connections
  - public.broker_accounts
  - public.account_snapshots
  - public.symbols
  - public.historical_candles
*/

-- 1. TYPE DEFINITIONS
CREATE TYPE public.broker_provider AS ENUM (
    'mt5', 'mt4', 'ibkr', 'ctrader', 'dx_trade', 'tradelynx', 'csv'
);

CREATE TYPE public.account_type AS ENUM (
    'demo', 'funded', 'live', 'prop_challenge'
);

-- 2. TABLES

/**
 * broker_connections
 * Management of external API links.
 */
CREATE TABLE public.broker_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider public.broker_provider NOT NULL,
    status TEXT DEFAULT 'disconnected' NOT NULL,
    encrypted_credentials JSONB DEFAULT '{}'::jsonb NOT NULL,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

/**
 * broker_accounts
 * Specific trading accounts under a connection.
 */
CREATE TABLE public.broker_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES public.broker_connections(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    account_number TEXT NOT NULL,
    name TEXT NOT NULL,
    type public.account_type DEFAULT 'demo' NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    balance NUMERIC(18, 2) DEFAULT 0 NOT NULL,
    equity NUMERIC(18, 2) DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT unique_account_per_provider UNIQUE (connection_id, account_number)
);

/**
 * account_snapshots
 * Periodic snapshots for temporal equity analytics.
 */
CREATE TABLE public.account_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.broker_accounts(id) ON DELETE CASCADE,
    balance NUMERIC(18, 2) NOT NULL,
    equity NUMERIC(18, 2) NOT NULL,
    margin NUMERIC(18, 2),
    free_margin NUMERIC(18, 2),
    floating_pnl NUMERIC(18, 2) DEFAULT 0 NOT NULL,
    captured_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/**
 * symbols
 * Asset class taxonomy.
 */
CREATE TABLE public.symbols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_class TEXT NOT NULL,
    venue TEXT,
    symbol TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_symbol_venue UNIQUE (asset_class, venue, symbol)
);

/**
 * historical_candles
 * High-fidelity market data repository.
 */
CREATE TABLE public.historical_candles (
    symbol_id UUID NOT NULL REFERENCES public.symbols(id) ON DELETE CASCADE,
    timeframe TEXT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    open NUMERIC NOT NULL,
    high NUMERIC NOT NULL,
    low NUMERIC NOT NULL,
    close NUMERIC NOT NULL,
    volume NUMERIC DEFAULT 0 NOT NULL,
    spread NUMERIC,
    PRIMARY KEY (symbol_id, timeframe, ts)
);

/**
 * risk_profiles
 * Configurable safety limits per workspace.
 */
CREATE TABLE public.risk_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    daily_loss_limit NUMERIC(5, 4) NOT NULL,
    weekly_loss_limit NUMERIC(5, 4) NOT NULL,
    max_drawdown_limit NUMERIC(5, 4) NOT NULL,
    max_losing_streak INTEGER NOT NULL,
    risk_per_trade NUMERIC(5, 4) NOT NULL,
    prop_firm TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- 3. INDEXES
CREATE INDEX idx_broker_connections_org ON public.broker_connections(organization_id);
CREATE INDEX idx_broker_accounts_org ON public.broker_accounts(organization_id);
CREATE INDEX idx_account_snapshots_lookup ON public.account_snapshots(account_id, captured_at DESC);
CREATE INDEX idx_historical_candles_lookup ON public.historical_candles(symbol_id, timeframe, ts DESC);
CREATE INDEX idx_risk_profiles_org ON public.risk_profiles(organization_id);

-- 4. TRIGGERS
CREATE TRIGGER tr_broker_conn_ts BEFORE INSERT OR UPDATE ON public.broker_connections FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();
CREATE TRIGGER tr_broker_conn_audit BEFORE INSERT OR UPDATE ON public.broker_connections FOR EACH ROW EXECUTE FUNCTION public.handle_user_metadata();

CREATE TRIGGER tr_broker_acc_ts BEFORE INSERT OR UPDATE ON public.broker_accounts FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();

CREATE TRIGGER tr_risk_profiles_ts BEFORE INSERT OR UPDATE ON public.risk_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();

-- 5. RLS POLICIES
ALTER TABLE public.broker_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_candles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY manage_connections ON public.broker_connections
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));

CREATE POLICY manage_accounts ON public.broker_accounts
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));

CREATE POLICY select_snapshots ON public.account_snapshots
    FOR SELECT USING (account_id IN (SELECT id FROM public.broker_accounts));

CREATE POLICY select_symbols ON public.symbols
    FOR SELECT USING (true); -- Public read for verified symbols

CREATE POLICY select_candles ON public.historical_candles
    FOR SELECT USING (true); -- Public read for market data

CREATE POLICY manage_risk_profiles ON public.risk_profiles
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));
