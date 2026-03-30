import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-gap">
      <h1>未找到题目</h1>
      <p className="muted">该题目可能已被隐藏或不存在。</p>
      <Link href="/">返回题目列表</Link>
    </section>
  );
}
