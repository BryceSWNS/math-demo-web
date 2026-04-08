import { notFound, redirect } from "next/navigation";

import { updateProblemAction } from "@/app/actions";
import { ProblemForm } from "@/components/problem-form";
import { buildTeacherLoginPath, isTeacherAuthenticated } from "@/lib/domain/teacher-auth";
import { getProblemById } from "@/lib/repositories/problems";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TeacherEditProblemPage({ params }: Props) {
  const { id } = await params;
  if (!(await isTeacherAuthenticated())) {
    redirect(buildTeacherLoginPath(`/teacher/problems/${id}/edit`) as never);
  }

  const problem = await getProblemById(id);
  if (!problem) notFound();

  return (
    <section className="section-gap">
      <ProblemForm formAction={updateProblemAction} mode="edit" initialProblem={problem} />
    </section>
  );
}
