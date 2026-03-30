import Link from "next/link";

import { listVisibleProblems } from "@/lib/repositories/problems";

export default async function HomePage() {
  const problems = await listVisibleProblems();

  return (
    <section className="section-gap">
      <h1>题目列表</h1>
      <p className="muted">点击题目可查看详情与评论区。</p>
      <div className="stack">
        {problems.map((problem) => (
          <article key={problem.id} className="card">
            <h2>
              <Link href={`/problems/${problem.id}`}>{problem.title}</Link>
            </h2>
            <p className="muted">
              难度: {problem.difficulty} | 标签: {problem.tags.join(", ") || "无"} | 发布者:{" "}
              {problem.createdByAlias}
            </p>
            <p>{problem.stemMd.slice(0, 120)}...</p>
            <Link href={`/problems/${problem.id}`}>进入评论区</Link>
          </article>
        ))}
        {problems.length === 0 ? <p className="muted">暂无题目，请先发布一题。</p> : null}
      </div>
    </section>
  );
}
