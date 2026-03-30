import { z } from "zod";

import type { CommentRecord } from "@/lib/domain/types";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

const createCommentInputSchema = z.object({
  problemId: z.string().uuid(),
  parentId: z.string().uuid().nullable().optional(),
  authorRole: z.enum(["teacher", "student"]),
  authorAlias: z.string().min(2).max(24),
  contentMd: z.string().min(1).max(4000)
});

type DbCommentRow = {
  id: string;
  problem_id: string;
  parent_id: string | null;
  author_role: "teacher" | "student";
  author_alias: string;
  content_md: string;
  is_hidden: boolean;
  hidden_reason: string | null;
  created_at: string;
};

export type CommentNode = CommentRecord & {
  replies: CommentNode[];
};

export async function createComment(input: z.infer<typeof createCommentInputSchema>) {
  const payload = createCommentInputSchema.parse(input);
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("comments").insert({
    problem_id: payload.problemId,
    parent_id: payload.parentId ?? null,
    author_role: payload.authorRole,
    author_alias: payload.authorAlias,
    content_md: payload.contentMd
  });
  if (error) throw new Error(`发表评论失败: ${error.message}`);
}

export async function listTopLevelComments(problemId: string, page: number, pageSize: number) {
  const supabase = createSupabaseServerClient();
  const from = Math.max(0, (page - 1) * pageSize);
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("problem_id", problemId)
    .is("parent_id", null)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw new Error(`加载评论失败: ${error.message}`);
  return (data ?? []).map(mapCommentRow);
}

export async function countTopLevelComments(problemId: string) {
  const supabase = createSupabaseServerClient();
  const { count, error } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("problem_id", problemId)
    .is("parent_id", null)
    .eq("is_hidden", false);
  if (error) throw new Error(`统计评论失败: ${error.message}`);
  return count ?? 0;
}

export async function listChildComments(problemId: string, parentId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("problem_id", problemId)
    .eq("parent_id", parentId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`加载回复失败: ${error.message}`);
  return (data ?? []).map(mapCommentRow);
}

export async function hideComment(commentId: string, reason: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("comments")
    .update({ is_hidden: true, hidden_reason: reason })
    .eq("id", commentId);
  if (error) throw new Error(`隐藏评论失败: ${error.message}`);
}

function mapCommentRow(row: DbCommentRow): CommentRecord {
  return {
    id: row.id,
    problemId: row.problem_id,
    parentId: row.parent_id,
    authorRole: row.author_role,
    authorAlias: row.author_alias,
    contentMd: row.content_md,
    isHidden: row.is_hidden,
    hiddenReason: row.hidden_reason,
    createdAt: row.created_at
  };
}
