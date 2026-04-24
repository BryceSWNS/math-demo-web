import { z } from "zod";

import { SUBJECTS } from "@/lib/domain/subjects";
import type { ProblemDifficulty, ProblemOption, ProblemRecord, ProblemSubject } from "@/lib/domain/types";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

const problemInputBaseSchema = z.object({
  subject: z.enum(SUBJECTS).default("probability-statistics"),
  questionNo: z
    .string()
    .trim()
    .regex(/^\d+\.\d+$/, "题号格式必须为“章号.题号”，如 1.1 或 12.11")
    .optional()
    .nullable(),
  title: z.string().min(3).max(120),
  stemMd: z.string().min(1),
  options: z.array(z.object({ key: z.string().min(1), text: z.string().min(1) })).default([]),
  answerMd: z.string().default(""),
  analysisMd: z.string().default(""),
  tags: z.array(z.string().min(1).max(30)).default([]),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium")
});

const createProblemInputSchema = problemInputBaseSchema.extend({
  createdByAlias: z.string().min(2).max(24)
}).superRefine((data, ctx) => {
  if (data.subject === "microeconomics-terms" && !data.questionNo) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["questionNo"],
      message: "微观名词解释栏目必须填写题号，如 1.1"
    });
  }
});

const updateProblemInputSchema = problemInputBaseSchema.superRefine((data, ctx) => {
  if (data.subject === "microeconomics-terms" && !data.questionNo) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["questionNo"],
      message: "微观名词解释栏目必须填写题号，如 1.1"
    });
  }
});

type DbProblemRow = {
  id: string;
  subject: ProblemSubject | null;
  question_no: string | null;
  title: string;
  stem_md: string;
  options_json: unknown;
  answer_md: string;
  analysis_md: string;
  tags: string[] | null;
  difficulty: ProblemDifficulty;
  is_hidden: boolean;
  created_by_alias: string;
  created_at: string;
};

export type CreateProblemInput = z.infer<typeof createProblemInputSchema>;
export type UpdateProblemInput = z.infer<typeof updateProblemInputSchema>;

export async function listVisibleProblems() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`加载题目失败: ${error.message}`);
  return (data ?? []).map(mapProblemRow);
}

export async function listVisibleProblemsBySubject(subject: ProblemSubject) {
  const supabase = createSupabaseServerClient();
  let query = supabase.from("problems").select("*").eq("is_hidden", false).eq("subject", subject);
  if (subject === "microeconomics-terms") {
    query = query.order("chapter_no", { ascending: true, nullsFirst: false });
    query = query.order("item_no", { ascending: true, nullsFirst: false });
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }
  const { data, error } = await query;
  if (error) throw new Error(`按栏目加载题目失败: ${error.message}`);
  return (data ?? []).map(mapProblemRow);
}

export async function getProblemById(problemId: string): Promise<ProblemRecord | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("problems").select("*").eq("id", problemId).maybeSingle();
  if (error) throw new Error(`获取题目失败: ${error.message}`);
  if (!data || data.is_hidden) return null;
  return mapProblemRow(data);
}

export async function createProblem(input: CreateProblemInput): Promise<string> {
  const payload = createProblemInputSchema.parse(input);
  const normalizedQuestionNo = payload.questionNo?.trim() || null;
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("problems")
    .insert({
      subject: payload.subject,
      question_no: normalizedQuestionNo,
      title: payload.title,
      stem_md: payload.stemMd,
      options_json: payload.options,
      answer_md: payload.answerMd,
      analysis_md: payload.analysisMd,
      tags: payload.tags,
      difficulty: payload.difficulty,
      created_by_alias: payload.createdByAlias
    })
    .select("id")
    .single();
  if (error) throw new Error(`创建题目失败: ${error.message}`);
  return data.id;
}

export async function updateProblem(problemId: string, input: UpdateProblemInput): Promise<void> {
  const payload = updateProblemInputSchema.parse(input);
  const normalizedQuestionNo = payload.questionNo?.trim() || null;
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("problems")
    .update({
      subject: payload.subject,
      question_no: normalizedQuestionNo,
      title: payload.title,
      stem_md: payload.stemMd,
      options_json: payload.options,
      answer_md: payload.answerMd,
      analysis_md: payload.analysisMd,
      tags: payload.tags,
      difficulty: payload.difficulty
    })
    .eq("id", problemId);
  if (error) throw new Error(`更新题目失败: ${error.message}`);
}

export async function addProblemAssets(
  problemId: string,
  assets: Array<{ fileUrl: string; fileType: "image" | "pdf"; sortOrder: number }>
) {
  if (!assets.length) return;
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("problem_assets").insert(
    assets.map((asset) => ({
      problem_id: problemId,
      file_url: asset.fileUrl,
      file_type: asset.fileType,
      sort_order: asset.sortOrder
    }))
  );
  if (error) throw new Error(`保存附件失败: ${error.message}`);
}

export async function listProblemAssets(problemId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("problem_assets")
    .select("*")
    .eq("problem_id", problemId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`加载附件失败: ${error.message}`);
  return data ?? [];
}

export async function hideProblem(problemId: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("problems").update({ is_hidden: true }).eq("id", problemId);
  if (error) throw new Error(`隐藏题目失败: ${error.message}`);
}

function mapProblemRow(row: DbProblemRow): ProblemRecord {
  return {
    id: row.id,
    subject: row.subject ?? "probability-statistics",
    questionNo: row.question_no,
    title: row.title,
    stemMd: row.stem_md,
    options: normalizeOptions(row.options_json),
    answerMd: row.answer_md,
    analysisMd: row.analysis_md,
    tags: row.tags ?? [],
    difficulty: row.difficulty,
    isHidden: row.is_hidden,
    createdByAlias: row.created_by_alias,
    createdAt: row.created_at
  };
}

function normalizeOptions(input: unknown): ProblemOption[] {
  if (!Array.isArray(input)) return [];
  return input.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const key = String((item as Record<string, unknown>).key ?? "").trim();
    const text = String((item as Record<string, unknown>).text ?? "").trim();
    if (!key || !text) return [];
    return [{ key, text }];
  });
}
