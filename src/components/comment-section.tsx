import Link from "next/link";

import { AdminHideCommentForm } from "@/components/admin-hide-comment-form";
import { CommentForm } from "@/components/comment-form";
import { CommentNode } from "@/components/comment-node";
import { countTopLevelComments, listTopLevelComments } from "@/lib/repositories/comments";

type Props = {
  problemId: string;
  page: number;
};

const PAGE_SIZE = 10;

export async function CommentSection({ problemId, page }: Props) {
  const [items, total] = await Promise.all([
    listTopLevelComments(problemId, page, PAGE_SIZE),
    countTopLevelComments(problemId)
  ]);
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="card section-gap">
      <h2>评论区</h2>
      <CommentForm problemId={problemId} />
      <hr />
      <p className="muted">
        当前第 {page} / {maxPage} 页，共 {total} 条顶层评论
      </p>

      <div className="stack">
        {items.map((item) => (
          <div key={item.id} className="comment-wrapper">
            <CommentNode problemId={problemId} node={item} />
            <AdminHideCommentForm commentId={item.id} problemId={problemId} />
          </div>
        ))}
        {items.length === 0 ? <p className="muted">还没有评论，欢迎第一个留言。</p> : null}
      </div>

      <nav className="pager">
        {page > 1 ? <Link href={`/problems/${problemId}?page=${page - 1}`}>上一页</Link> : <span />}
        {page < maxPage ? <Link href={`/problems/${problemId}?page=${page + 1}`}>下一页</Link> : <span />}
      </nav>
    </section>
  );
}
