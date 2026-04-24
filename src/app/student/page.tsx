import Link from "next/link";

export default function StudentHomePage() {
  return (
    <section className="section-gap">
      <div className="grid-3">
        <article className="card">
          <h2>概率论与数理统计</h2>
          <p className="muted">随机变量、分布、估计、检验与回归等内容。</p>
          <Link href="/student/probability-statistics">进入栏目</Link>
        </article>
        <article className="card">
          <h2>微观经济学</h2>
          <p className="muted">消费者理论、生产与成本、市场结构等内容。</p>
          <Link href="/student/microeconomics">进入栏目</Link>
        </article>
        <article className="card">
          <h2>微观名词解释</h2>
          <p className="muted">微观经济学核心概念与术语释义。</p>
          <Link href="/student/microeconomics-terms">进入栏目</Link>
        </article>
      </div>
    </section>
  );
}
