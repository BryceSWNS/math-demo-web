import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { teacherLogoutAction } from "@/app/actions";
import { LazyMarkdownMath } from "@/components/lazy-markdown-math";
import { SUBJECT_LABELS, getSubjectChapters, isSubject, parseQuestionNo } from "@/lib/domain/subjects";
import { buildTeacherLoginPath, isTeacherAuthenticated } from "@/lib/domain/teacher-auth";
import { listVisibleProblemSummariesBySubject } from "@/lib/repositories/problems";

type Props = {
  params: Promise<{ subject: string; chapterNo: string }>;
};

export default async function TeacherSubjectChapterPage({ params }: Props) {
  const { subject, chapterNo } = await params;
  if (!isSubject(subject)) notFound();
  if (!(await isTeacherAuthenticated())) {
    redirect(buildTeacherLoginPath(`/teacher/${subject}/chapter/${chapterNo}`) as never);
  }

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
        老师界面 · {SUBJECT_LABELS[subject]} · 第 {currentChapter.chapterNo} 章 · {currentChapter.title}
      </h1>
      <p className="muted">可发布新题并编辑本章历史题目，详情页保留治理入口。</p>
      <div className="inline-links">
        <Link href={`/teacher/${subject}`}>返回章节列表</Link>
        <Link href={`/teacher/problems/new?subject=${subject}`}>发布新题目</Link>
      </div>
      <form action={teacherLogoutAction}>
        <button type="submit" className="secondary-button">
          退出老师登录
        </button>
      </form>
      <div className="stack">
        {chapterProblems.map((problem) => (
          <article key={problem.id} className="card">
            <h2>
              <Link href={`/problems/${problem.id}?viewer=teacher`}>
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
            <div className="inline-links">
              <Link href={`/problems/${problem.id}?viewer=teacher`}>进入详情/评论</Link>
              <Link href={`/teacher/problems/${problem.id}/edit`}>编辑题目</Link>
            </div>
          </article>
        ))}
        {chapterProblems.length === 0 ? <p className="muted">本章暂无题目，请先发布一题。</p> : null}
      </div>
    </section>
  );
}
