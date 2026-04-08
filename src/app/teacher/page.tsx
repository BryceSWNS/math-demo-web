import Link from "next/link";
import { redirect } from "next/navigation";

import { teacherLogoutAction } from "@/app/actions";
import { buildTeacherLoginPath, isTeacherAuthenticated } from "@/lib/domain/teacher-auth";

export default async function TeacherHomePage() {
  if (!(await isTeacherAuthenticated())) {
    redirect(buildTeacherLoginPath("/teacher") as never);
  }

  return (
    <section className="section-gap">
      <h1>老师界面</h1>
      <p className="muted">请选择栏目后管理对应题目。</p>
      <form action={teacherLogoutAction}>
        <button type="submit" className="secondary-button">
          退出老师登录
        </button>
      </form>
      <div className="grid-2">
        <article className="card">
          <h2>概率论与数理统计</h2>
          <p className="muted">随机变量、分布、估计、检验与回归等内容。</p>
          <Link href="/teacher/probability-statistics">进入栏目</Link>
        </article>
        <article className="card">
          <h2>微观经济学</h2>
          <p className="muted">消费者理论、生产与成本、市场结构等内容。</p>
          <Link href="/teacher/microeconomics">进入栏目</Link>
        </article>
      </div>
    </section>
  );
}
