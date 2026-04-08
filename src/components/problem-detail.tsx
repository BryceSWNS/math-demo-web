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
  return (
    <article className="card section-gap">
      <header>
        <h1>{problem.title}</h1>
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
        <h2>题干</h2>
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

      {problem.answerMd ? (
        <section>
          <h2>答案</h2>
          <MarkdownMath source={problem.answerMd} />
        </section>
      ) : null}

      {problem.analysisMd ? (
        <section>
          <h2>解析</h2>
          <MarkdownMath source={problem.analysisMd} />
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
