import { supabase } from "./supabase";
import type { Organization } from "./types";

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithEmail(email: string, password: string, onboardingData?: {
  experience: string;
  style: string;
  assets: string[];
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        experience_level: onboardingData?.experience,
        trading_style: onboardingData?.style,
        preferred_assets: onboardingData?.assets
      }
    }
  });

  if (error) throw error;

  // Initialize preferences if the user was created successfully
  if (data.user && onboardingData) {
    const { error: prefError } = await supabase.from("user_preferences").upsert({
      user_id: data.user.id,
      experience_level: onboardingData.experience,
      trading_style: onboardingData.style,
      preferred_assets: onboardingData.assets
    });
    if (prefError) console.error("Failed to save onboarding preferences", prefError);
  }

  return data;
}

export async function signInWithProvider(provider: "google" | "github") {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin }
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function createOrganization(name: string) {
  const session = await getSession();
  if (!session) throw new Error("Sign in required.");

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name,
      slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`
    })
    .select("id")
    .single();

  if (orgError) throw orgError;

  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: session.user.id,
      role: "owner"
    });

  if (memberError) throw memberError;
  return org.id as string;
}

export async function loadPrimaryOrganization(): Promise<Organization | null> {
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(id, name)")
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  // Supabase returns an object for 1-to-1 or many-to-1 joins
  const organization = data?.organizations as any;
  if (!organization) return null;

  if (Array.isArray(organization)) {
    return organization[0] ? { id: organization[0].id, name: organization[0].name } : null;
  }

  return { id: organization.id, name: organization.name };
}
