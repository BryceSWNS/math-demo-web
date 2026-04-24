"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SUBJECT_LABELS, isSubject } from "@/lib/domain/subjects";

export function TopbarBrand() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const brandText =
    segments[0] === "student" && segments.length >= 2 && isSubject(segments[1])
      ? SUBJECT_LABELS[segments[1]]
      : "乐湖华研题库";

  return (
    <Link href="/" className="brand">
      {brandText}
    </Link>
  );
}
