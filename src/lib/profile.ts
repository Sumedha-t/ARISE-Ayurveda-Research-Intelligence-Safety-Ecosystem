import { createClient } from "@/lib/supabase/server";

export type UserProfile = {
  id: string;
  full_name: string;
  role: string;
  email: string;
};

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, email")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return profile;
}