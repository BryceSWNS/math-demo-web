import Link from "next/link";
import { notFound } from "next/navigation";

import { SUBJECT_LABELS, getSubjectChapters, isSubject, parseQuestionNo } from "@/lib/domain/subjects";
import { listVisibleProblemSummariesBySubject } from "@/lib/repositories/problems";

const CHAPTER_SECTIONS = [
  { slug: "examples", label: "例题" },
  { slug: "exercises", label: "习题" }
] as const;

type ChapterSectionSlug = (typeof CHAPTER_SECTIONS)[number]["slug"];

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
  if (subject !== "probability-statistics") notFound();

  const problems = await listVisibleProblemSummariesBySubject(subject);
  const chapterProblems = problems.filter((problem) => parseQuestionNo(problem.questionNo)?.chapterNo === chapterNoValue);
  const sectionCountMap = new Map<ChapterSectionSlug, number>();
  for (const problem of chapterProblems) {
    const section = problem.chapterSection ?? "exercises";
    sectionCountMap.set(section, (sectionCountMap.get(section) ?? 0) + 1);
  }

  return (
    <section className="section-gap">
      <h1>
        {SUBJECT_LABELS[subject]} · 第 {currentChapter.chapterNo} 章 · {currentChapter.title}
      </h1>
      <div className="inline-links">
        <Link href={`/student/${subject}`}>返回章节列表</Link>
      </div>
      <div className="grid-3">
        {CHAPTER_SECTIONS.map((section) => (
          <article key={section.slug} className="card">
            <h2>{section.label}</h2>
            <p className="muted">题目数：{sectionCountMap.get(section.slug) ?? 0}</p>
            <Link href={`/student/${subject}/chapter/${chapterNoValue}/${section.slug}`}>进入{section.label}</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
