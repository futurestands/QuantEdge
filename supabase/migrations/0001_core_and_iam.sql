-- =====================================================================
-- MIGRATION: 0001_core_and_iam
-- PURPOSE: Enterprise foundation for Multi-tenancy, IAM, and Immutable Auditing.
-- DATE: 2024-05-23
-- AUTHOR: QuantEdge Senior Architect
-- =====================================================================

/*
  PURPOSE:
  This migration establishes the root identity and workspace isolation foundation for the
  QuantEdge Trading Research & Discipline Operating System. It implements strict multi-tenancy
  using Row Level Security (RLS) and ensures all mutations are recorded in an immutable ledger.

  AFFECTED TABLES:
  - public.organizations
  - public.organization_members
  - public.user_preferences
  - public.audit_logs
  - public.tags
  - public.feature_flags

  REORDERED FOR DEPENDENCY INTEGRITY:
  1. Extensions
  2. Legacy Preservation
  3. ENUMs
  4. Trigger Functions
  5. Tables (Base -> Leaf)
  6. Indexes
  7. Triggers
  8. Helper Functions
  9. RLS & Policies
*/

-- 1. INITIALIZATION
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. LEGACY PRESERVATION (Safe Refactor)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
        ALTER TABLE public.audit_logs RENAME TO _legacy_v2_audit_logs;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organization_members') THEN
        ALTER TABLE public.organization_members RENAME TO _legacy_v2_organization_members;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organizations') THEN
        ALTER TABLE public.organizations RENAME TO _legacy_v2_organizations;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tags') THEN
        ALTER TABLE public.tags RENAME TO _legacy_v2_tags;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feature_flags') THEN
        ALTER TABLE public.feature_flags RENAME TO _legacy_v2_feature_flags;
    END IF;
END $$;

-- 3. TYPE DEFINITIONS (Enforcing Domain Integrity)

CREATE TYPE public.organization_role AS ENUM ('owner', 'admin', 'analyst', 'viewer');
COMMENT ON TYPE public.organization_role IS 'RBAC roles defining access levels within a workspace.';

CREATE TYPE public.tag_category AS ENUM ('general', 'strategy', 'trade', 'behavior', 'market');
COMMENT ON TYPE public.tag_category IS 'Classification for the global tagging system.';

CREATE TYPE public.event_type AS ENUM (
    'auth_login', 'auth_logout',
    'create_workspace', 'update_workspace', 'delete_workspace',
    'create_strategy', 'update_strategy', 'version_strategy',
    'import_market_data', 'run_backtest',
    'create_trade', 'update_trade', 'journal_trade',
    'breach_rule', 'system_error'
);
COMMENT ON TYPE public.event_type IS 'Standardized security and data mutation events.';

CREATE TYPE public.resource_type AS ENUM (
    'organization', 'member', 'strategy', 'backtest', 'trade', 'journal', 'attachment', 'profile'
);
COMMENT ON TYPE public.resource_type IS 'Entities targeted by audit logs or attachments.';

-- 4. TRIGGER FUNCTIONS (Must exist before Triggers)

/**
 * handle_timestamps
 * Standardizes created_at and updated_at across the platform.
 */
CREATE OR REPLACE FUNCTION public.handle_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        NEW.created_at = now();
    END IF;
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/**
 * handle_user_metadata
 * Automatically populates created_by and updated_by.
 */
CREATE OR REPLACE FUNCTION public.handle_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        IF (TG_OP = 'INSERT') THEN
            NEW.created_by = auth.uid();
        END IF;
        NEW.updated_by = auth.uid();
    EXCEPTION WHEN undefined_column THEN
        -- Silently continue if table lacks these columns
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. TABLES (Must exist before Indexes, Triggers, and Helper Functions)

/**
 * organizations
 * The root container for all QuantEdge data. Supports soft-delete.
 */
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug CITEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    country TEXT,
    default_language TEXT DEFAULT 'en' NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),

    CONSTRAINT name_length CHECK (char_length(name) >= 2)
);

COMMENT ON TABLE public.organizations IS 'Primary tenant container. All data in the platform is isolated by organization_id.';

/**
 * organization_members
 * Maps users to organizations with specific RBAC roles.
 */
CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.organization_role NOT NULL DEFAULT 'viewer',
    joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),

    CONSTRAINT unique_org_user UNIQUE (organization_id, user_id)
);

/**
 * user_preferences
 * Per-user settings across all or specific workspaces.
 */
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark' NOT NULL,
    dashboard_layout JSONB DEFAULT '{}'::jsonb NOT NULL,
    default_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    notification_settings JSONB DEFAULT '{"email": true, "push": false}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/**
 * audit_logs
 * Immutable append-only ledger for all mutations.
 */
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    event_type public.event_type NOT NULL,
    resource_type public.resource_type NOT NULL,
    resource_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    location JSONB,
    correlation_id UUID,
    request_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/**
 * tags
 * Shared taxonomy for trades, strategies, and research.
 */
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    color TEXT,
    category public.tag_category DEFAULT 'general' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),

    CONSTRAINT unique_tag_per_org UNIQUE (organization_id, label)
);

/**
 * feature_flags
 * Controls feature availability at the workspace level.
 */
CREATE TABLE public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    flag_key TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT false NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_by UUID REFERENCES auth.users(id),

    CONSTRAINT unique_flag_per_org UNIQUE (organization_id, flag_key)
);

-- 6. INDEXES (Must exist after Tables)

CREATE INDEX idx_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_audit_logs_org ON public.audit_logs(organization_id);
CREATE INDEX idx_tags_org ON public.tags(organization_id);
CREATE INDEX idx_flags_org ON public.feature_flags(organization_id);
CREATE INDEX idx_orgs_slug ON public.organizations(slug);
CREATE INDEX idx_audit_logs_user_created ON public.audit_logs(user_id, created_at DESC);

-- 7. TRIGGERS (Must exist after Tables and Trigger Functions)

CREATE TRIGGER tr_orgs_ts BEFORE INSERT OR UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();
CREATE TRIGGER tr_orgs_audit BEFORE INSERT OR UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.handle_user_metadata();

CREATE TRIGGER tr_members_ts BEFORE INSERT OR UPDATE ON public.organization_members FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();
CREATE TRIGGER tr_members_audit BEFORE INSERT OR UPDATE ON public.organization_members FOR EACH ROW EXECUTE FUNCTION public.handle_user_metadata();

CREATE TRIGGER tr_prefs_ts BEFORE INSERT OR UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();

CREATE TRIGGER tr_tags_ts BEFORE INSERT OR UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();
CREATE TRIGGER tr_tags_audit BEFORE INSERT OR UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.handle_user_metadata();

CREATE TRIGGER tr_flags_ts BEFORE INSERT OR UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.handle_timestamps();
CREATE TRIGGER tr_flags_audit BEFORE INSERT OR UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.handle_user_metadata();

-- 8. HELPER FUNCTIONS (Must exist after Tables)

/**
 * get_my_organizations
 * Returns a set of organization UUIDs where the current auth.uid() is a member.
 */
CREATE OR REPLACE FUNCTION public.get_my_organizations(required_role public.organization_role DEFAULT NULL)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid()
  AND (required_role IS NULL OR role = required_role);
$$;

-- 9. RLS POLICIES (Hardened for Bootstrap)

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Organizations
CREATE POLICY select_org ON public.organizations
    FOR SELECT USING (id IN (SELECT public.get_my_organizations()));

CREATE POLICY insert_org ON public.organizations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY update_org ON public.organizations
    FOR UPDATE USING (id IN (SELECT public.get_my_organizations('owner')))
    WITH CHECK (id IN (SELECT public.get_my_organizations('owner')));

-- Organization Members
CREATE POLICY select_members ON public.organization_members
    FOR SELECT USING (organization_id IN (SELECT public.get_my_organizations()));

CREATE POLICY insert_members ON public.organization_members
    FOR INSERT WITH CHECK (
        (user_id = auth.uid() AND NOT EXISTS (SELECT 1 FROM public.organization_members AS m WHERE m.organization_id = organization_members.organization_id))
        OR organization_id IN (SELECT public.get_my_organizations('admin'))
        OR organization_id IN (SELECT public.get_my_organizations('owner'))
    );

CREATE POLICY manage_members ON public.organization_members
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations('admin')) OR organization_id IN (SELECT public.get_my_organizations('owner')))
    WITH CHECK (organization_id IN (SELECT public.get_my_organizations('admin')) OR organization_id IN (SELECT public.get_my_organizations('owner')));

-- User Preferences
CREATE POLICY select_prefs ON public.user_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY insert_prefs ON public.user_preferences FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY update_prefs ON public.user_preferences FOR UPDATE USING (user_id = auth.uid());

-- Audit Logs (IMMUTABLE: Only SELECT and INSERT)
CREATE POLICY select_audit ON public.audit_logs
    FOR SELECT USING (organization_id IN (SELECT public.get_my_organizations()));

CREATE POLICY insert_audit ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Tags
CREATE POLICY select_tags ON public.tags
    FOR SELECT USING (organization_id IN (SELECT public.get_my_organizations()));

CREATE POLICY manage_tags ON public.tags
    FOR ALL USING (organization_id IN (SELECT public.get_my_organizations('analyst'))
                   OR organization_id IN (SELECT public.get_my_organizations('admin'))
                   OR organization_id IN (SELECT public.get_my_organizations('owner')));

-- Feature Flags
CREATE POLICY select_flags ON public.feature_flags
    FOR SELECT USING (organization_id IN (SELECT public.get_my_organizations()));
