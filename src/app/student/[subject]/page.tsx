import Link from "next/link";
import { notFound } from "next/navigation";

import { LazyMarkdownMath } from "@/components/lazy-markdown-math";
import { getSubjectChapters, isSubject, parseQuestionNo } from "@/lib/domain/subjects";
import { listVisibleProblemSummariesBySubject } from "@/lib/repositories/problems";

type Props = {
  params: Promise<{ subject: string }>;
};

export default async function StudentSubjectPage({ params }: Props) {
  const { subject } = await params;
  if (!isSubject(subject)) notFound();
  const problems = await listVisibleProblemSummariesBySubject(subject);
  const chapters = getSubjectChapters(subject);

  if (chapters.length > 0) {
    const chapterCountMap = new Map<number, number>();
    for (const problem of problems) {
      const parsed = parseQuestionNo(problem.questionNo);
      if (!parsed) continue;
      chapterCountMap.set(parsed.chapterNo, (chapterCountMap.get(parsed.chapterNo) ?? 0) + 1);
    }

    return (
      <section className="section-gap">
        <div className="grid-3">
          {chapters.map((chapter) => (
            <article key={chapter.chapterNo} className="card">
              <h2>
                第 {chapter.chapterNo} 章 · {chapter.title}
              </h2>
              <p className="muted">题目数：{chapterCountMap.get(chapter.chapterNo) ?? 0}</p>
              <Link href={`/student/${subject}/chapter/${chapter.chapterNo}`}>进入本章题目</Link>
            </article>
          ))}
        </div>
      </section>
    );
  }

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
