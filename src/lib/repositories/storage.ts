import { randomUUID } from "node:crypto";

import { createSupabaseServiceClient } from "@/lib/supabase/server";

const BUCKET_NAME = "problem-assets";

export async function uploadProblemAttachment(problemId: string, file: File) {
  const supabase = createSupabaseServiceClient();
  const ext = file.name.includes(".") ? file.name.split(".").at(-1) : "bin";
  const objectPath = `${problemId}/${randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(objectPath, file, {
    upsert: false,
    contentType: file.type || "application/octet-stream"
  });
  if (error) throw new Error(`附件上传失败: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(objectPath);
  return data.publicUrl;
}

export function inferAssetType(file: File): "image" | "pdf" {
  if (file.type === "application/pdf") return "pdf";
  return "image";
}
