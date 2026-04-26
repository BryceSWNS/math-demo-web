import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { teacherLogoutAction } from "@/app/actions";
import { LazyMarkdownMath } from "@/components/lazy-markdown-math";
import { getSubjectChapters, isSubject, parseQuestionNo } from "@/lib/domain/subjects";
import { buildTeacherLoginPath, isTeacherAuthenticated } from "@/lib/domain/teacher-auth";
import { listVisibleProblemSummariesBySubject } from "@/lib/repositories/problems";

const CHAPTER_SECTIONS = [
  { slug: "examples", label: "例题" },
  { slug: "exercises", label: "习题" }
] as const;

type ChapterSectionSlug = (typeof CHAPTER_SECTIONS)[number]["slug"];

function isChapterSectionSlug(value: string): value is ChapterSectionSlug {
  return CHAPTER_SECTIONS.some((section) => section.slug === value);
}

type Props = {
  params: Promise<{ subject: string; chapterNo: string; section: string }>;
};

export default async function TeacherChapterSectionPage({ params }: Props) {
  const { subject, chapterNo, section } = await params;
  if (!isSubject(subject) || subject !== "probability-statistics" || !isChapterSectionSlug(section)) notFound();
  if (!(await isTeacherAuthenticated())) {
    redirect(buildTeacherLoginPath(`/teacher/${subject}/chapter/${chapterNo}/${section}`) as never);
  }

  const chapterNoValue = Number(chapterNo);
  if (!Number.isInteger(chapterNoValue) || chapterNoValue <= 0) notFound();

  const currentChapter = getSubjectChapters(subject).find((chapter) => chapter.chapterNo === chapterNoValue);
  if (!currentChapter) notFound();

  const chapterProblems = (await listVisibleProblemSummariesBySubject(subject))
    .filter((problem) => parseQuestionNo(problem.questionNo)?.chapterNo === chapterNoValue)
    .filter((problem) => (problem.chapterSection ?? "exercises") === section)
    .sort((a, b) => {
      const aQ = parseQuestionNo(a.questionNo);
      const bQ = parseQuestionNo(b.questionNo);
      const aItem = aQ?.itemNo ?? Number.MAX_SAFE_INTEGER;
      const bItem = bQ?.itemNo ?? Number.MAX_SAFE_INTEGER;
      if (aItem !== bItem) return aItem - bItem;
      const aSub = aQ?.subItemNo ?? Number.MAX_SAFE_INTEGER;
      const bSub = bQ?.subItemNo ?? Number.MAX_SAFE_INTEGER;
      return aSub - bSub;
    });

  const sectionLabel = CHAPTER_SECTIONS.find((item) => item.slug === section)?.label ?? "习题";

  return (
    <section className="section-gap">
      <nav className="breadcrumb">
        <Link href={`/teacher/${subject}`}>第 {currentChapter.chapterNo} 章 {currentChapter.title}</Link>
        <span className="breadcrumb-sep" />
        <span>{sectionLabel}</span>
      </nav>
      <div className="inline-links">
        <Link href={`/teacher/problems/new?subject=${subject}`}>发布新题目</Link>
        <form action={teacherLogoutAction}>
          <button type="submit" className="secondary-button">
            退出登录
          </button>
        </form>
      </div>
      <div className="problem-list">
        {chapterProblems.map((problem) => (
          <article key={problem.id} className="problem-card">
            <div className="problem-card-header">
              <Link href={`/problems/${problem.id}?viewer=teacher`} className="problem-card-no">
                {problem.questionNo || problem.title}
              </Link>
              <Link href={`/teacher/problems/${problem.id}/edit`} className="problem-card-action muted">编辑</Link>
            </div>
            <div className="problem-card-stem">
              <LazyMarkdownMath source={problem.stemMd} placeholderHeight={24} />
            </div>
            <span className="problem-card-meta">
              {problem.difficulty} · {problem.tags.join(", ") || "无标签"}
            </span>
          </article>
        ))}
        {chapterProblems.length === 0 ? <p className="muted">本分组暂无题目，请先发布一题。</p> : null}
      </div>
    </section>
  );
}
