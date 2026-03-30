import { describe, expect, it } from "vitest";

import { buildIdentityContextFromSession, parseIdentity } from "@/lib/domain/identity";

describe("identity", () => {
  it("parses identity from plain object", () => {
    const identity = parseIdentity({ role: "teacher", alias: "王老师" });
    expect(identity.role).toBe("teacher");
    expect(identity.alias).toBe("王老师");
  });

  it("keeps fallback identity when no session user id", () => {
    const fallback = { role: "student" as const, alias: "小明" };
    const result = buildIdentityContextFromSession(fallback);
    expect(result).toEqual(fallback);
  });

  it("adds user id when session exists", () => {
    const fallback = { role: "student" as const, alias: "小明" };
    const result = buildIdentityContextFromSession(fallback, "u-123");
    expect(result.userId).toBe("u-123");
  });
});
