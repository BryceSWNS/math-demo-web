import { createClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv, getServerSupabaseEnv } from "@/lib/supabase/env";

export function createSupabaseServerClient() {
  const env = getPublicSupabaseEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function createSupabaseServiceClient() {
  const env = getServerSupabaseEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false
    }
  });
}
