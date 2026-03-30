"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseIdentity } from "@/lib/domain/identity";
import { createComment, hideComment } from "@/lib/repositories/comments";
import { createModerationEvent } from "@/lib/repositories/moderation";
import { addProblemAssets, createProblem, hideProblem } from "@/lib/repositories/problems";
import { inferAssetType, uploadProblemAttachment } from "@/lib/repositories/storage";
import { getServerSupabaseEnv } from "@/lib/supabase/env";

function ensureAdminToken(inputToken: string) {
  const env = getServerSupabaseEnv();
  if (inputToken !== env.ADMIN_TOKEN) {
    throw new Error("管理员令牌无效");
  }
}

function parseOptions(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [head, ...rest] = line.split(".");
      if (rest.length > 0 && head.trim().length <= 2) {
        return { key: head.trim(), text: rest.join(".").trim() };
      }
      return { key: String.fromCharCode(65 + index), text: line };
    });
}

function parseTags(raw: string) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function createProblemAction(formData: FormData) {
  const identity = parseIdentity(formData);
  const title = String(formData.get("title") ?? "").trim();
  const stemMd = String(formData.get("stemMd") ?? "").trim();
  const optionsRaw = String(formData.get("optionsRaw") ?? "");
  const answerMd = String(formData.get("answerMd") ?? "");
  const analysisMd = String(formData.get("analysisMd") ?? "");
  const tagsRaw = String(formData.get("tagsRaw") ?? "");
  const difficulty = String(formData.get("difficulty") ?? "medium");

  const problemId = await createProblem({
    title,
    stemMd,
    options: parseOptions(optionsRaw),
    answerMd,
    analysisMd,
    tags: parseTags(tagsRaw),
    difficulty: difficulty as "easy" | "medium" | "hard",
    createdByAlias: identity.alias
  });

  const files = formData.getAll("attachments").filter((x): x is File => x instanceof File && x.size > 0);
  const assets: Array<{ fileUrl: string; fileType: "image" | "pdf"; sortOrder: number }> = [];
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const url = await uploadProblemAttachment(problemId, file);
    assets.push({
      fileUrl: url,
      fileType: inferAssetType(file),
      sortOrder: i
    });
  }
  await addProblemAssets(problemId, assets);
  revalidatePath("/");
  revalidatePath(`/problems/${problemId}`);
  redirect(`/problems/${problemId}`);
}

export async function createCommentAction(formData: FormData) {
  const identity = parseIdentity(formData);
  const problemId = String(formData.get("problemId") ?? "");
  const parentIdRaw = String(formData.get("parentId") ?? "").trim();
  const contentMd = String(formData.get("contentMd") ?? "").trim();

  await createComment({
    problemId,
    parentId: parentIdRaw || null,
    authorRole: identity.role,
    authorAlias: identity.alias,
    contentMd
  });
  revalidatePath(`/problems/${problemId}`);
}

export async function hideProblemAction(formData: FormData) {
  const adminToken = String(formData.get("adminToken") ?? "");
  const operatorAlias = String(formData.get("operatorAlias") ?? "admin");
  const problemId = String(formData.get("problemId") ?? "");
  ensureAdminToken(adminToken);
  await hideProblem(problemId);
  await createModerationEvent({
    targetType: "problem",
    targetId: problemId,
    action: "hide",
    operatorAlias
  });
  revalidatePath("/");
  redirect("/");
}

export async function hideCommentAction(formData: FormData) {
  const adminToken = String(formData.get("adminToken") ?? "");
  const operatorAlias = String(formData.get("operatorAlias") ?? "admin");
  const commentId = String(formData.get("commentId") ?? "");
  const problemId = String(formData.get("problemId") ?? "");
  const hiddenReason = String(formData.get("hiddenReason") ?? "违规内容");
  ensureAdminToken(adminToken);
  await hideComment(commentId, hiddenReason);
  await createModerationEvent({
    targetType: "comment",
    targetId: commentId,
    action: "hide",
    operatorAlias
  });
  revalidatePath(`/problems/${problemId}`);
}
