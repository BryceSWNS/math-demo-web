# 数学题目网页

无登录：老师上传题目，学生浏览题目并可在评论区交流

## 项目介绍
本项目旨在构建一个无登录的数学题目网页：老师可上传题目，学生可浏览并进入题目评论区，多级评论可发布；基于 Next.js + Supabase，并为后续登录与角色体系预留扩展点。

当前阶段边界：
- 支持题目标题、题干（Markdown/LaTeX）、选项/答案、解析、附件（图片/PDF）、标签与难度。
- 支持学生进入题目详情后查看并发布多级评论（楼中楼）。
- 支持基础治理能力：老师可对题目和评论进行编辑
- 维护 `docs/DEV_LOG.md`，持续记录设计与实现决策。

## 技术栈
- Next.js (App Router)
- Supabase (Postgres + Storage)
- Markdown + LaTeX (`react-markdown` + `remark-math` + `rehype-katex`)

## 本地启动
1. 安装依赖
   ```bash
   npm install
   ```
2. 配置环境变量
   ```bash
   cp .env.example .env.local
   ```
3. 在 Supabase 执行 `supabase/migrations` 下 SQL。
4. 启动
   ```bash
   npm run dev
   ```
   如果你在 WSL/代理环境中遇到 `TypeError: fetch failed`，请改为：
   ```bash
   NODE_USE_ENV_PROXY=1 npm run dev
   ```

## 环境变量
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_TOKEN`（管理隐藏操作使用）

## 目录说明
- `src/app`：页面与 API 路由
- `src/components`：UI 组件
- `src/lib/repositories`：数据访问层
- `src/lib/domain`：领域模型与身份抽象
- `supabase/migrations`：数据库迁移
- `docs/DEV_LOG.md`：逐步开发记录

## 后续登录扩展建议
1. 接入 Supabase Auth 后，把 `parseIdentity` 切换为从 Session 获取身份。
2. 将 `author_user_id` 设为必填并完成数据迁移。
3. 以 RLS + JWT claims 做老师/学生/管理员权限控制。
