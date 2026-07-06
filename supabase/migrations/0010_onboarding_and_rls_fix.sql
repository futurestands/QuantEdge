-- =====================================================================
-- MIGRATION: 0010_onboarding_and_rls_fix
-- PURPOSE: Fix RLS for organization creation and add onboarding fields.
-- DATE: 2024-07-07
-- AUTHOR: QuantEdge AI Agent
-- =====================================================================

-- 1. FIX RLS FOR ORGANIZATIONS
-- Allow creators to see their own organizations even before membership record is created.
DROP POLICY IF EXISTS select_org ON public.organizations;
CREATE POLICY select_org ON public.organizations
    FOR SELECT USING (
        id IN (SELECT public.get_my_organizations())
        OR created_by = auth.uid()
    );

-- Explicitly allow authenticated users to create their first workspace.
DROP POLICY IF EXISTS insert_org ON public.organizations;
CREATE POLICY insert_org ON public.organizations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. FIX RLS FOR ORGANIZATION MEMBERS
-- Ensure the creator can add themselves as the owner.
DROP POLICY IF EXISTS insert_members ON public.organization_members;
CREATE POLICY insert_members ON public.organization_members
    FOR INSERT WITH CHECK (
        (user_id = auth.uid()) -- Allow users to add themselves
        OR organization_id IN (SELECT public.get_my_organizations('admin'))
        OR organization_id IN (SELECT public.get_my_organizations('owner'))
    );

-- 3. ENHANCE USER PREFERENCES FOR ONBOARDING
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS trading_style TEXT,
ADD COLUMN IF NOT EXISTS preferred_assets TEXT[];

-- 3. COMMENTS
COMMENT ON COLUMN public.user_preferences.experience_level IS 'Self-reported trading experience (e.g., Beginner, Professional).';
COMMENT ON COLUMN public.user_preferences.trading_style IS 'Primary trading methodology (e.g., Scalping, Swing).';
COMMENT ON COLUMN public.user_preferences.preferred_assets IS 'Initial list of symbols or asset classes the user is interested in.';
