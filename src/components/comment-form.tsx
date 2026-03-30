"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  problemId: string;
  parentId?: string;
  compact?: boolean;
};

export function CommentForm({ problemId, parentId, compact = false }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      problemId,
      parentId: parentId ?? null,
      role: String(formData.get("role") ?? "student"),
      alias: String(formData.get("alias") ?? "").trim(),
      contentMd: String(formData.get("contentMd") ?? "").trim()
    };

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "发表评论失败");
      }
      form.reset();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "发表评论失败");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`comment-form ${compact ? "compact" : ""}`}>
      <div className="grid-2">
        <label>
          身份
          <select name="role" defaultValue="student" required>
            <option value="teacher">老师</option>
            <option value="student">学生</option>
          </select>
        </label>
        <label>
          昵称
          <input name="alias" required minLength={2} maxLength={24} />
        </label>
      </div>
      <label>
        评论内容（Markdown + LaTeX）
        <textarea name="contentMd" rows={compact ? 2 : 4} required />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button type="submit" disabled={pending}>
        {pending ? "提交中..." : parentId ? "回复" : "发表评论"}
      </button>
    </form>
  );
}
