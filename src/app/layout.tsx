import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "乐湖华研题库",
  description: "面向多学科题库的演示系统，支持老师发布与学生浏览评论"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="topbar">
          <div className="container topbar-inner">
            <Link href="/" className="brand">
              乐湖华研题库
            </Link>
            <nav>
              <Link href="/student">学生界面</Link>
              <Link href="/teacher/login?next=%2Fteacher">老师界面</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
