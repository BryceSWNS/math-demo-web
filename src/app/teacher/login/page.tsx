import { teacherLoginAction } from "@/app/actions";

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function TeacherLoginPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const nextPath = resolvedSearchParams.next ?? "/teacher";
  const hasError = resolvedSearchParams.error === "1";

  return (
    <section className="section-gap">
      <form action={teacherLoginAction} className="card form-grid">
        <h1>老师登录</h1>
        <p className="muted">请输入管理员口令（与 `.env.local` 的 `ADMIN_TOKENM` 一致）。</p>
        <input type="hidden" name="next" value={nextPath} />
        <label>
          口令
          <input type="password" name="password" required minLength={8} autoFocus />
        </label>
        {hasError ? <p className="error">口令不正确，请重试。</p> : null}
        <button type="submit">进入老师界面</button>
      </form>
    </section>
  );
}
