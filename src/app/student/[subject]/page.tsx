import Link from "next/link";
import { notFound } from "next/navigation";

import { LazyMarkdownMath } from "@/components/lazy-markdown-math";
import { isSubject } from "@/lib/domain/subjects";
import { listVisibleProblemSummariesBySubject } from "@/lib/repositories/problems";

type Props = {
  params: Promise<{ subject: string }>;
};

export default async function StudentSubjectPage({ params }: Props) {
  const { subject } = await params;
  if (!isSubject(subject)) notFound();
  const problems = await listVisibleProblemSummariesBySubject(subject);

  return (
    <section className="section-gap">
      <div className="stack">
        {problems.map((problem) => (
          <article key={problem.id} className="card">
            <h2>
              <Link href={`/problems/${problem.id}?viewer=student`}>
                {problem.questionNo ? `${problem.questionNo} ` : ""}
                {problem.title}
              </Link>
            </h2>
            {subject !== "microeconomics-terms" ? (
              <p className="muted">
                难度: {problem.difficulty} | 标签: {problem.tags.join(", ") || "无"} | 发布者:{" "}
                {problem.createdByAlias}
              </p>
            ) : null}
            <div className="problem-excerpt">
              <LazyMarkdownMath source={problem.stemMd} placeholderHeight={40} />
            </div>
            <Link href={`/problems/${problem.id}?viewer=student`}>进入详情/评论</Link>
          </article>
        ))}
        {problems.length === 0 ? <p className="muted">该栏目暂无题目，请稍后再来。</p> : null}
      </div>
    </section>
  );
}
