import { NextRequest, NextResponse } from "next/server";

import { createComment, listChildComments } from "@/lib/repositories/comments";

export async function GET(request: NextRequest) {
  const problemId = request.nextUrl.searchParams.get("problemId");
  const parentId = request.nextUrl.searchParams.get("parentId");
  if (!problemId || !parentId) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }
  try {
    const items = await listChildComments(problemId, parentId);
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      problemId?: string;
      parentId?: string | null;
      role?: "teacher" | "student";
      alias?: string;
      contentMd?: string;
    };
    if (!body.problemId || !body.role || !body.alias || !body.contentMd) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }
    await createComment({
      problemId: body.problemId,
      parentId: body.parentId ?? null,
      authorRole: body.role,
      authorAlias: body.alias,
      contentMd: body.contentMd
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
