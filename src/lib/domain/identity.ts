import { z } from "zod";

import type { IdentityContext } from "@/lib/domain/types";

const identitySchema = z.object({
  role: z.enum(["teacher", "student"]),
  alias: z
    .string()
    .min(2, "昵称至少 2 个字符")
    .max(24, "昵称最多 24 个字符")
    .regex(/^[\w\u4e00-\u9fa5\- ]+$/, "昵称包含非法字符")
});

export function parseIdentity(input: FormData | Record<string, unknown>): IdentityContext {
  const data =
    input instanceof FormData
      ? {
          role: String(input.get("role") ?? ""),
          alias: String(input.get("alias") ?? "").trim()
        }
      : input;

  const parsed = identitySchema.parse(data);
  return parsed;
}

/**
 * 预留：将来切换到 Supabase Auth 后，只需要替换本函数实现。
 */
export function buildIdentityContextFromSession(
  fallback: IdentityContext,
  sessionUserId?: string
): IdentityContext {
  if (!sessionUserId) {
    return fallback;
  }
  return {
    ...fallback,
    userId: sessionUserId
  };
}
