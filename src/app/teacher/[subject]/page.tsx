import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { teacherLogoutAction } from "@/app/actions";
import { LazyMarkdownMath } from "@/components/lazy-markdown-math";
import { SUBJECT_LABELS, getSubjectChapters, isSubject, parseQuestionNo } from "@/lib/domain/subjects";
import { buildTeacherLoginPath, isTeacherAuthenticated } from "@/lib/domain/teacher-auth";
import { listVisibleProblemSummariesBySubject } from "@/lib/repositories/problems";

const CHAPTER_SECTIONS = [
  { slug: "examples", label: "例题" },
  { slug: "exercises", label: "习题" }
] as const;

type ChapterSectionSlug = (typeof CHAPTER_SECTIONS)[number]["slug"];

type Props = {
  params: Promise<{ subject: string }>;
};

export default async function TeacherSubjectPage({ params }: Props) {
  const { subject } = await params;
  if (!isSubject(subject)) notFound();
  if (!(await isTeacherAuthenticated())) {
    redirect(buildTeacherLoginPath(`/teacher/${subject}`) as never);
  }

  const problems = await listVisibleProblemSummariesBySubject(subject);
  const subjectLabel = SUBJECT_LABELS[subject];
  const chapters = getSubjectChapters(subject);

  if (subject === "probability-statistics" && chapters.length > 0) {
    const chapterCountMap = new Map<number, number>();
    const chapterSectionCountMap = new Map<number, Map<ChapterSectionSlug, number>>();
    for (const problem of problems) {
      const parsed = parseQuestionNo(problem.questionNo);
      if (!parsed) continue;
      chapterCountMap.set(parsed.chapterNo, (chapterCountMap.get(parsed.chapterNo) ?? 0) + 1);
      const section = problem.chapterSection ?? "exercises";
      const sectionMap = chapterSectionCountMap.get(parsed.chapterNo) ?? new Map<ChapterSectionSlug, number>();
      sectionMap.set(section, (sectionMap.get(section) ?? 0) + 1);
      chapterSectionCountMap.set(parsed.chapterNo, sectionMap);
    }

    return (
      <section className="section-gap">
        <h1>老师界面 · {subjectLabel}</h1>
        <div className="inline-links">
          <Link href="/teacher">返回栏目</Link>
          <Link href={`/teacher/problems/new?subject=${subject}`}>发布新题目</Link>
        </div>
        <form action={teacherLogoutAction}>
          <button type="submit" className="secondary-button">
            退出老师登录
          </button>
        </form>
        <div className="grid-3">
          {chapters.map((chapter) => (
            <article key={chapter.chapterNo} className="card">
              <h2>
                第 {chapter.chapterNo} 章 · {chapter.title}
              </h2>
              <p className="muted">题目数：{chapterCountMap.get(chapter.chapterNo) ?? 0}</p>
              <div className="inline-links">
                {CHAPTER_SECTIONS.map((section) => (
                  <Link key={section.slug} href={`/teacher/${subject}/chapter/${chapter.chapterNo}/${section.slug}`}>
                    {section.label}（{chapterSectionCountMap.get(chapter.chapterNo)?.get(section.slug) ?? 0}）
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="section-gap">
      <h1>老师界面 · {subjectLabel}</h1>
      <p className="muted">可发布新题并编辑历史题目，详情页保留治理入口。</p>
      <div className="inline-links">
        <Link href="/teacher">返回栏目</Link>
        <Link href={`/teacher/problems/new?subject=${subject}`}>发布新题目</Link>
      </div>
      <form action={teacherLogoutAction}>
        <button type="submit" className="secondary-button">
          退出老师登录
        </button>
      </form>
      <div className="stack">
        {problems.map((problem) => (
          <article key={problem.id} className="card">
            <h2>
              <Link href={`/problems/${problem.id}?viewer=teacher`}>
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
            <div className="inline-links">
              <Link href={`/problems/${problem.id}?viewer=teacher`}>进入详情/评论</Link>
              <Link href={`/teacher/problems/${problem.id}/edit`}>编辑题目</Link>
            </div>
          </article>
        ))}
        {problems.length === 0 ? <p className="muted">该栏目暂无题目，请先发布一题。</p> : null}
      </div>
    </section>
  );
}
