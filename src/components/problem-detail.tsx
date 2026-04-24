import { MarkdownMath } from "@/components/markdown-math";
import type { ProblemRecord } from "@/lib/domain/types";

type Asset = {
  id: string;
  file_url: string;
  file_type: "image" | "pdf";
};

type Props = {
  problem: ProblemRecord;
  assets: Asset[];
};

function normalizeOptionMath(text: string) {
  if (text.includes("$")) return text;

  return text.replace(
    /([a-zA-Z][a-zA-Z0-9^_]*(?:\s*[+\-*/=]\s*[a-zA-Z0-9^_]+)+)/g,
    (raw) => {
      const normalized = raw.replace(/\b([a-zA-Z])(\d+)\b/g, "$1_{$2}");
      return `$${normalized}$`;
    }
  );
}

export function ProblemDetail({ problem, assets }: Props) {
  const isMicroTerms = problem.subject === "microeconomics-terms";
  const hasAnswer = Boolean(problem.answerMd?.trim());
  const hasAnalysis = Boolean(problem.analysisMd?.trim());

  const stemHeading = isMicroTerms ? "概念" : "题干";
  const revealSummaryTitle = isMicroTerms ? "名词解释与案例" : "答案";
  const revealHint = isMicroTerms
    ? hasAnswer && hasAnalysis
      ? "默认折叠，展开后可查看名词解释与案例"
      : hasAnswer
        ? "默认折叠，展开后可查看名词解释"
        : "默认折叠，展开后可查看案例"
    : hasAnswer && hasAnalysis
      ? "点击展开后可查看答案与解析"
      : hasAnswer
        ? "点击展开后可查看答案"
        : "点击展开后可查看解析";

  const answerBlockHeading = isMicroTerms ? "名词解释" : "答案";
  const analysisBlockHeading = isMicroTerms ? "案例" : "解析";

  return (
    <article className="card section-gap">
      <header>
        <h1>
          {problem.questionNo ? `${problem.questionNo} ` : ""}
          {problem.title}
        </h1>
        <div className="meta-row">
          <span className="tag">{problem.difficulty}</span>
          {problem.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
          <span className="muted">发布者: {problem.createdByAlias}</span>
        </div>
      </header>

      <section>
        <h2>{stemHeading}</h2>
        <MarkdownMath source={problem.stemMd} />
      </section>

      {problem.options.length ? (
        <section>
          <h2>选项</h2>
          <ul>
            {problem.options.map((opt) => (
              <li key={opt.key}>
                <strong>{opt.key}.</strong> <MarkdownMath source={normalizeOptionMath(opt.text)} inline />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasAnswer || hasAnalysis ? (
        <section className="answer-reveal-section">
          <details className="answer-reveal">
            <summary className="answer-reveal-summary">
              <span className="answer-reveal-summary-title">{revealSummaryTitle}</span>
              <span className="answer-reveal-summary-hint muted">{revealHint}</span>
            </summary>
            <div className="answer-reveal-body stack">
              {problem.answerMd ? (
                <>
                  <h2 className="answer-reveal-subheading">{answerBlockHeading}</h2>
                  <MarkdownMath source={problem.answerMd} />
                </>
              ) : null}
              {problem.analysisMd ? (
                <>
                  <h2 className="answer-reveal-subheading">{analysisBlockHeading}</h2>
                  <MarkdownMath source={problem.analysisMd} />
                </>
              ) : null}
            </div>
          </details>
        </section>
      ) : null}

      {assets.length ? (
        <section>
          <h2>附件</h2>
          <div className="asset-grid">
            {assets.map((asset) =>
              asset.file_type === "image" ? (
                <img key={asset.id} src={asset.file_url} alt="题目附件" className="asset-image" />
              ) : (
                <a key={asset.id} href={asset.file_url} target="_blank" rel="noreferrer">
                  查看 PDF 附件
                </a>
              )
            )}
          </div>
        </section>
      ) : null}
    </article>
  );
}
