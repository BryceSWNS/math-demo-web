import Link from "next/link";

export default function StudentHomePage() {
  return (
    <section className="section-gap">
      <h1>学生界面</h1>
      <p className="muted">请选择栏目后查看对应题目列表。</p>
      <div className="grid-2">
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
      </div>
    </section>
  );
}
