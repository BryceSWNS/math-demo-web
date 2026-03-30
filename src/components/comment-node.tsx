"use client";

import { useState } from "react";

import { CommentForm } from "@/components/comment-form";
import { MarkdownMath } from "@/components/markdown-math";
import type { CommentRecord } from "@/lib/domain/types";

type Props = {
  problemId: string;
  node: CommentRecord;
  depth?: number;
};

export function CommentNode({ problemId, node, depth = 0 }: Props) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [children, setChildren] = useState<CommentRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadChildren() {
    if (loaded || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/comments?problemId=${problemId}&parentId=${node.id}`);
      if (!res.ok) throw new Error("加载回复失败");
      const data = (await res.json()) as { items: CommentRecord[] };
      setChildren(data.items);
      setLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="comment-node" style={{ marginLeft: depth ? 16 : 0 }}>
      <header className="comment-meta">
        <strong>{node.authorAlias}</strong>
        <span className="role-tag">{node.authorRole === "teacher" ? "老师" : "学生"}</span>
        <time>{new Date(node.createdAt).toLocaleString("zh-CN")}</time>
      </header>
      <MarkdownMath source={node.contentMd} />

      <div className="comment-actions">
        <button type="button" onClick={() => setShowReplyForm((v) => !v)}>
          {showReplyForm ? "取消回复" : "回复"}
        </button>
        <button type="button" onClick={loadChildren} disabled={loading}>
          {loading ? "加载中..." : loaded ? "刷新回复" : "查看回复"}
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}
      {showReplyForm ? <CommentForm problemId={problemId} parentId={node.id} compact /> : null}

      <div className="comment-children">
        {children.map((child) => (
          <CommentNode key={child.id} problemId={problemId} node={child} depth={depth + 1} />
        ))}
      </div>
    </article>
  );
}
