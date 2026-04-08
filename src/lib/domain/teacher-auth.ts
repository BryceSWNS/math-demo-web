import { cookies } from "next/headers";

import { getServerSupabaseEnv } from "@/lib/supabase/env";

export const TEACHER_AUTH_COOKIE = "teacher_auth";

export function sanitizeNextPath(input: string) {
  if (!input.startsWith("/") || input.startsWith("//")) {
    return "/teacher";
  }
  return input;
}

export function buildTeacherLoginPath(nextPath: string) {
  return `/teacher/login?next=${encodeURIComponent(sanitizeNextPath(nextPath))}`;
}

export async function isTeacherAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TEACHER_AUTH_COOKIE)?.value;
  if (!token) return false;
  return token === getServerSupabaseEnv().ADMIN_TOKEN;
}
