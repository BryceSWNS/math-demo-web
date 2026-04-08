"use client";

import "katex/dist/katex.min.css";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

type Props = {
  source: string;
  inline?: boolean;
};

function normalizeMathDelimiters(input: string) {
  const unescaped = input.replace(/\\\$/g, "$");
  return unescaped.replace(/\$\$([^\n$]+?)\$\$/g, (_, expr: string) => `$${expr.trim()}$`);
}

export function MarkdownMath({ source, inline = false }: Props) {
  const normalizedSource = normalizeMathDelimiters(source);
  const Wrapper = inline ? "span" : "div";

  return (
    <Wrapper className={`markdown${inline ? " markdown-inline" : ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={
          inline
            ? {
                p: ({ children }) => <span>{children}</span>
              }
            : undefined
        }
      >
        {normalizedSource}
      </ReactMarkdown>
    </Wrapper>
  );
}
