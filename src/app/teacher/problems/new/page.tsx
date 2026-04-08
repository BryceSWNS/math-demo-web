import { redirect } from "next/navigation";

import { createProblemAction } from "@/app/actions";
import { ProblemForm } from "@/components/problem-form";
import { isSubject } from "@/lib/domain/subjects";
import { buildTeacherLoginPath, isTeacherAuthenticated } from "@/lib/domain/teacher-auth";

type Props = {
  searchParams: Promise<{ subject?: string }>;
};

export default async function TeacherNewProblemPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  if (!(await isTeacherAuthenticated())) {
    redirect(buildTeacherLoginPath("/teacher/problems/new") as never);
  }
  const requestedSubject = String(resolvedSearchParams.subject ?? "");
  const initialSubject = isSubject(requestedSubject) ? requestedSubject : "probability-statistics";

  return (
    <section className="section-gap">
      <ProblemForm formAction={createProblemAction} mode="create" initialSubject={initialSubject} />
    </section>
  );
}
