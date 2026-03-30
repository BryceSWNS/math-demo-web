import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function createModerationEvent(input: {
  targetType: "problem" | "comment";
  targetId: string;
  action: "hide" | "unhide";
  operatorAlias: string;
}) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("moderation_events").insert({
    target_type: input.targetType,
    target_id: input.targetId,
    action: input.action,
    operator_alias: input.operatorAlias
  });
  if (error) throw new Error(`记录治理日志失败: ${error.message}`);
}
