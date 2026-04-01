# DEV LOG - 数学题目网页 Demo

## 2026-03-31

### Step 1 - 项目骨架初始化
- 建立 `Next.js (App Router)` 项目目录结构。
- 建立 `src/app`、`src/components`、`src/lib`、`supabase/migrations`、`docs`。
- 配置 `TypeScript`、`ESLint`、基础样式与脚本。

### Step 2 - Supabase 数据模型与迁移
- 创建表：`problems`、`problem_assets`、`comments`、`moderation_events`。
- 选择评论结构为邻接表（`parent_id` 自引用）以支持多级楼中楼。
- 建立关键索引：
  - `comments(problem_id, parent_id, created_at)`
  - `problems(is_hidden, created_at)`
- 创建公开 bucket：`problem-assets` 用于图片/PDF 附件。
- 启用 RLS，并提供基础只读策略（仅可读取未隐藏内容）。

### Step 3 - 题目发布/展示主流程
- 发布页 `/problems/new` 支持：
  - 身份（老师/学生）+ 昵称
  - 题干（Markdown + LaTeX）
  - 选项、答案、解析、标签、难度
  - 图片/PDF 上传
- 首页 `/` 展示题目列表。
- 详情页 `/problems/[id]` 渲染题目、选项、答案、解析、附件。

### Step 4 - 评论区（多级楼中楼）
- 题目详情页内置评论区。
- 顶层评论分页（默认每页 10 条）。
- 子回复按需加载（点击“查看回复”从 API 拉取）。
- 评论可递归展示，支持任意层级。

### Step 5 - 管理隐藏能力（Demo）
- 提供基于 `ADMIN_TOKEN` 的治理入口（无登录阶段的临时方案）。
- 支持隐藏题目与隐藏评论。
- 同步写入 `moderation_events` 审计记录。

### Step 6 - 为后续登录/角色扩展预留
- 领域层提供 `IdentityContext` 与 `parseIdentity`，当前来自表单。
- 数据库预留 `author_user_id` 字段与索引。
- 将数据访问集中到 `repository`，后续替换 auth/权限逻辑时最小改动。

### Step 7 - 文档同步与部署路线
- 本文件必须对齐 `architecture.md` 
- 未来部署使用阿里云托管的Supbase产品，方便国内用户使用

## 后续扩展建议
1. 接入 Auth（邮箱或 OAuth），将 `alias+role` 迁移为真实用户体系。
2. 为评论与题目增加编辑、撤回和举报功能。
3. 为评论树增加层级限制和反垃圾策略（频率限制、关键词审查）。
4. 增加 E2E 测试（Playwright）覆盖发布、评论、隐藏流程。
