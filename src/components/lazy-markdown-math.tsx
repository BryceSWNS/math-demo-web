"use client";

import { useEffect, useRef, useState } from "react";

import { MarkdownMath } from "@/components/markdown-math";

type Props = {
  source: string;
  inline?: boolean;
  /** Estimated height before render to reduce layout shift */
  placeholderHeight?: number;
};

export function LazyMarkdownMath({ source, inline = false, placeholderHeight = 60 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (visible) {
    return <MarkdownMath source={source} inline={inline} />;
  }

  return (
    <div
      ref={ref}
      style={{ minHeight: placeholderHeight }}
      aria-hidden
    />
  );
}
