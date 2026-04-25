import Link from "next/link";
import { notFound } from "next/navigation";

import { LazyMarkdownMath } from "@/components/lazy-markdown-math";
import { SUBJECT_LABELS, getSubjectChapters, isSubject, parseQuestionNo } from "@/lib/domain/subjects";
import { listVisibleProblemSummariesBySubject } from "@/lib/repositories/problems";

type Props = {
  params: Promise<{ subject: string; chapterNo: string }>;
};

export default async function StudentSubjectChapterPage({ params }: Props) {
  const { subject, chapterNo } = await params;
  if (!isSubject(subject)) notFound();

  const chapterNoValue = Number(chapterNo);
  if (!Number.isInteger(chapterNoValue) || chapterNoValue <= 0) notFound();

  const chapters = getSubjectChapters(subject);
  const currentChapter = chapters.find((chapter) => chapter.chapterNo === chapterNoValue);
  if (!currentChapter) notFound();

  const problems = await listVisibleProblemSummariesBySubject(subject);
  const chapterProblems = problems
    .filter((problem) => parseQuestionNo(problem.questionNo)?.chapterNo === chapterNoValue)
    .sort((a, b) => {
      const aItemNo = parseQuestionNo(a.questionNo)?.itemNo ?? Number.MAX_SAFE_INTEGER;
      const bItemNo = parseQuestionNo(b.questionNo)?.itemNo ?? Number.MAX_SAFE_INTEGER;
      return aItemNo - bItemNo;
    });

  return (
    <section className="section-gap">
      <h1>
        {SUBJECT_LABELS[subject]} · 第 {currentChapter.chapterNo} 章 · {currentChapter.title}
      </h1>
      <div className="inline-links">
        <Link href={`/student/${subject}`}>返回章节列表</Link>
      </div>
      <div className="stack">
        {chapterProblems.map((problem) => (
          <article key={problem.id} className="card">
            <h2>
              <Link href={`/problems/${problem.id}?viewer=student`}>
                {problem.questionNo ? `${problem.questionNo} ` : ""}
                {problem.title}
              </Link>
            </h2>
            <p className="muted">
              难度: {problem.difficulty} | 标签: {problem.tags.join(", ") || "无"} | 发布者: {problem.createdByAlias}
            </p>
            <div className="problem-excerpt">
              <LazyMarkdownMath source={problem.stemMd} placeholderHeight={40} />
            </div>
            <Link href={`/problems/${problem.id}?viewer=student`}>进入详情/评论</Link>
          </article>
        ))}
        {chapterProblems.length === 0 ? <p className="muted">本章暂无题目，请稍后再来。</p> : null}
      </div>
    </section>
  );
}
