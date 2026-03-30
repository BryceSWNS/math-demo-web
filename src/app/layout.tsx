import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "数学题目 Demo",
  description: "老师上传题目，学生浏览并评论的演示系统"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="topbar">
          <div className="container topbar-inner">
            <Link href="/" className="brand">
              数学题目 Demo
            </Link>
            <nav>
              <Link href="/">题目列表</Link>
              <Link href="/problems/new">发布题目</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
