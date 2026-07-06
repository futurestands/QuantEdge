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

export async function signUpWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
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
  if (!session) throw new Error("Sign in before creating an organization.");

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

  const organization = data?.organizations as Organization | Organization[] | undefined;
  if (Array.isArray(organization)) return organization[0] ?? null;
  return organization ?? null;
}
