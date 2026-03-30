import type { IdentityContext } from "@/lib/domain/types";

export interface AuthProvider {
  getIdentity(): Promise<IdentityContext | null>;
}

/**
 * 当前 Demo 使用表单身份，因此默认返回 null。
 * 接入登录后，替换为 Supabase Auth Provider 即可。
 */
export class DemoAuthProvider implements AuthProvider {
  async getIdentity(): Promise<IdentityContext | null> {
    return null;
  }
}
