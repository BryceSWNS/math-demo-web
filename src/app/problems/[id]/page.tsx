import { notFound } from "next/navigation";

import { AdminHideProblemForm } from "@/components/admin-hide-problem-form";
import { CommentSection } from "@/components/comment-section";
import { ProblemDetail } from "@/components/problem-detail";
import { getProblemById, listProblemAssets } from "@/lib/repositories/problems";

type Props = {
  params: { id: string };
  searchParams: { page?: string };
};

export default async function ProblemDetailPage({ params, searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const [problem, assets] = await Promise.all([
    getProblemById(params.id),
    listProblemAssets(params.id)
  ]);
  if (!problem) notFound();

  return (
    <section className="section-gap">
      <ProblemDetail problem={problem} assets={assets} />
      <section className="card">
        <h2>管理员治理（Demo）</h2>
        <p className="muted">输入 admin token 可隐藏该题目。</p>
        <AdminHideProblemForm problemId={problem.id} />
      </section>
      <CommentSection problemId={problem.id} page={page} />
    </section>
  );
}
