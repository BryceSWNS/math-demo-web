# DEV LOG - 乐湖华研题库

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

### Step 5 - 管理隐藏能力
- 提供基于 `ADMIN_TOKEN` 的治理入口（无登录阶段的临时方案）。
- 支持隐藏题目与隐藏评论。
- 同步写入 `moderation_events` 审计记录。

### Step 6 - 为后续登录/角色扩展预留
- 领域层提供 `IdentityContext` 与 `parseIdentity`，当前来自表单。
- 数据库预留 `author_user_id` 字段与索引。
- 将数据访问集中到 `repository`，后续替换 auth/权限逻辑时最小改动。

## 2026-04-07

### Step 7 - 老师/学生界面分离 + 题目编辑能力
- 新增入口页面 `/`，引导进入 `/teacher` 或 `/student`。
- 新增老师界面 `/teacher`：
  - 可发布新题 `/teacher/problems/new`
  - 可编辑历史题 `/teacher/problems/[id]/edit`
- 新增学生界面 `/student`：仅浏览题目与评论，不提供题目发布/编辑入口。
- 题目详情页根据 `viewer=teacher|student` 区分展示：
  - 老师可见“编辑题目”和治理表单（隐藏题目/评论）
  - 学生仅可见题目内容与评论
- 数据层新增 `updateProblem`，支持更新标题、题干、选项、答案、解析、标签、难度；编辑时附件采用“追加上传”策略。

### Step 8 - 老师界面口令保护（ADMIN_TOKEN）
- 新增老师登录页 `/teacher/login`，输入口令并与 `.env.local` 中 `ADMIN_TOKEN` 比对。
- 登录成功后写入 `httpOnly` Cookie（8 小时有效），用于老师界面访问态。
- 老师相关页面（`/teacher`、`/teacher/problems/new`、`/teacher/problems/[id]/edit`）统一做服务端鉴权，未通过则重定向到登录页。
- 题目详情页若请求 `viewer=teacher` 且未登录，也会重定向到老师登录页。
- 老师侧关键 Server Action（发布、编辑、隐藏题目/评论）补充服务端鉴权，避免绕过前端入口直接调用。

## 2026-04-08

### Step 9 - 门户栏目化改造（概率统计 / 微观经济学）
- 将站点主标题从“数学题目”调整为“乐湖华研题库”，统一首页与全局导航品牌文案。
- 首页 `/` 调整为门户说明页，统一引导从右上角进入学生/老师界面。
- 学生界面与老师界面的访问路由保留在右上角导航区域，不再在首页主体区重复展示。
- 同步更新 `architecture.md`，保持文档与实际页面结构一致。

### Step 10 - 按栏目管理题目（角色内分栏）
- 明确并修正路由层级：栏目不与学生/老师并行，而是在角色界面内部作为二级入口。
- 学生界面 `/student`：
  - 先选栏目 `/student/probability-statistics`、`/student/microeconomics`
  - 进入栏目后再展示对应题目列表
- 老师界面 `/teacher`：
  - 先选栏目 `/teacher/probability-statistics`、`/teacher/microeconomics`
  - 进入栏目后管理对应题目，并可按当前栏目发布新题
- 数据库与数据层新增 `problems.subject` 字段（含迁移 `20260408_000003_problem_subject.sql`），实现题目与栏目的强绑定。
- 发布/编辑流程增加栏目字段，详情页老师操作区联动返回对应栏目与按栏目发布。

## 后续扩展建议
1. 接入 Auth（邮箱或 OAuth），将 `alias+role` 迁移为真实用户体系。
2. 为评论与题目增加编辑、撤回和举报功能。
3. 为评论树增加层级限制和反垃圾策略（频率限制、关键词审查）。
4. 增加 E2E 测试（Playwright）覆盖发布、评论、隐藏流程。
