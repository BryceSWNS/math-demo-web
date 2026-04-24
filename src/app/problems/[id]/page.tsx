import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AdminHideProblemForm } from "@/components/admin-hide-problem-form";
import { CommentSection } from "@/components/comment-section";
import { ProblemDetail } from "@/components/problem-detail";
import { buildTeacherLoginPath, isTeacherAuthenticated } from "@/lib/domain/teacher-auth";
import { getProblemById, listProblemAssets } from "@/lib/repositories/problems";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; viewer?: string }>;
};

function CommentSectionSkeleton() {
  return (
    <section className="card section-gap">
      <div className="skeleton-heading-sm" />
      <div className="skeleton-text" />
      <hr />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="skeleton-comment">
          <div className="skeleton-text-short" />
          <div className="skeleton-text" />
          <div className="skeleton-text" style={{ width: "70%" }} />
        </div>
      ))}
    </section>
  );
}

export default async function ProblemDetailPage({ params, searchParams }: Props) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const page = Math.max(1, Number(resolvedSearchParams.page ?? "1") || 1);
  const requestedTeacherViewer = resolvedSearchParams.viewer === "teacher";
  if (requestedTeacherViewer && !(await isTeacherAuthenticated())) {
    redirect(buildTeacherLoginPath(`/problems/${id}?viewer=teacher`) as never);
  }
  const viewer = requestedTeacherViewer ? "teacher" : "student";
  const [problem, assets] = await Promise.all([
    getProblemById(id),
    listProblemAssets(id)
  ]);
  if (!problem) notFound();

  return (
    <section className="section-gap">
      {viewer === "teacher" ? (
        <section className="card">
          <h2>老师操作</h2>
          <div className="inline-links">
            <Link href={`/teacher/${problem.subject}`}>返回栏目题目列表</Link>
            <Link href={`/teacher/problems/${problem.id}/edit`}>编辑当前题目</Link>
            <Link href={`/teacher/problems/new?subject=${problem.subject}`}>发布新题目</Link>
          </div>
        </section>
      ) : null}
      <ProblemDetail problem={problem} assets={assets} />
      {viewer === "teacher" ? (
        <section className="card">
          <h2>管理员治理</h2>
          <p className="muted">输入 admin token 可隐藏该题目。</p>
          <AdminHideProblemForm problemId={problem.id} />
        </section>
      ) : null}
      <Suspense fallback={<CommentSectionSkeleton />}>
        <CommentSection problemId={problem.id} page={page} viewer={viewer} />
      </Suspense>
    </section>
  );
}
