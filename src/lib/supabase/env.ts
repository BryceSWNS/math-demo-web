import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20)
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  ADMIN_TOKEN: z.string().min(8).optional(),
  ADMIN_TOKENM: z.string().min(8).optional()
});

export function getPublicSupabaseEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
}

export function getServerSupabaseEnv() {
  const parsed = serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_TOKEN: process.env.ADMIN_TOKEN,
    ADMIN_TOKENM: process.env.ADMIN_TOKENM
  });

  const adminToken = parsed.ADMIN_TOKENM ?? parsed.ADMIN_TOKEN;
  if (!adminToken) {
    throw new Error("缺少管理员口令环境变量：请设置 ADMIN_TOKENM（或兼容使用 ADMIN_TOKEN）");
  }

  return {
    ...parsed,
    ADMIN_TOKEN: adminToken
  };
}
