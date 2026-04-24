import { createClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv, getServerSupabaseEnv } from "@/lib/supabase/env";

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 300;

function isTransientError(err: unknown): boolean {
  if (err instanceof TypeError && /fetch failed|network|ECONNRESET|ETIMEDOUT|EAI_AGAIN/i.test(err.message)) {
    return true;
  }
  return false;
}

/**
 * Wraps global fetch with automatic retry on transient network errors
 * (DNS hiccups, connection resets, etc. — common in WSL2 / cold-start scenarios).
 */
function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let attempt = 0;
  const execute = async (): Promise<Response> => {
    try {
      return await fetch(input, init);
    } catch (err) {
      if (attempt < MAX_RETRIES && isTransientError(err)) {
        attempt++;
        await new Promise((r) => setTimeout(r, BASE_DELAY_MS * 2 ** (attempt - 1)));
        return execute();
      }
      throw err;
    }
  };
  return execute();
}

export function createSupabaseServerClient() {
  const env = getPublicSupabaseEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { fetch: fetchWithRetry },
  });
}

export function createSupabaseServiceClient() {
  const env = getServerSupabaseEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    global: { fetch: fetchWithRetry },
  });
}
