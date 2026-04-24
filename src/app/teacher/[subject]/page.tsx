import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { teacherLogoutAction } from "@/app/actions";
import { MarkdownMath } from "@/components/markdown-math";
import { SUBJECT_LABELS, isSubject } from "@/lib/domain/subjects";
import { buildTeacherLoginPath, isTeacherAuthenticated } from "@/lib/domain/teacher-auth";
import { listVisibleProblemsBySubject } from "@/lib/repositories/problems";

type Props = {
  params: Promise<{ subject: string }>;
};

export default async function TeacherSubjectPage({ params }: Props) {
  const { subject } = await params;
  if (!isSubject(subject)) notFound();
  if (!(await isTeacherAuthenticated())) {
    redirect(buildTeacherLoginPath(`/teacher/${subject}`) as never);
  }

  const problems = await listVisibleProblemsBySubject(subject);
  const subjectLabel = SUBJECT_LABELS[subject];

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
            <p className="muted">
              难度: {problem.difficulty} | 标签: {problem.tags.join(", ") || "无"} | 发布者:{" "}
              {problem.createdByAlias}
            </p>
            <div className="problem-excerpt">
              <MarkdownMath source={problem.stemMd} />
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
