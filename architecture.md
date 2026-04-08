---
name: math-web-architecture-v2
overview: 乐湖华研题库 v2.0 当前实现架构基线（以代码为准）：学生按栏目浏览题目并参与评论，老师经口令登录后可按栏目发布/编辑题目并执行治理操作，后端基于 Next.js Server Actions + Supabase（Postgres + Storage）。
isProject: false
---

# 乐湖华研题库架构文档（Version 2.0）

## 1. 当前阶段定位

- 本项目仍处于“轻认证演示版”：学生端无登录，老师端采用 `ADMIN_TOKEN + httpOnly Cookie`。
- 路由采用“角色 -> 栏目 -> 题目”的层级组织，栏目固定为：
  - `probability-statistics`（概率论与数理统计）
  - `microeconomics`（微观经济学）
- 题目支持 Markdown + LaTeX、选项、答案、解析、标签、难度、图片/PDF 附件。
- 评论支持楼中楼（邻接表），顶层分页、子回复按需加载。
- 治理能力支持隐藏题目与隐藏评论，并写入治理审计日志。

## 2. 技术栈与分层

- 前端/服务端一体：Next.js App Router（React 19）
- 数据与文件：Supabase Postgres + Supabase Storage
- 内容渲染：`react-markdown` + `remark-math` + `rehype-katex`
- 输入校验：`zod`
- 代码分层：
  - `src/app`：页面、API Route、Server Actions（编排层）
  - `src/components`：展示与交互组件
  - `src/lib/repositories`：数据访问（与 Supabase 交互）
  - `src/lib/domain`：领域类型、栏目定义、身份与老师鉴权能力
  - `src/lib/supabase`：环境变量与客户端工厂

## 3. 运行架构（请求流）

1. 浏览器访问 Next.js 页面或提交表单。
2. Server Action / Route Handler 执行业务编排与权限校验。
3. Repository 调用 Supabase：
   - 读操作：`anon key`（`createSupabaseServerClient`）
   - 写操作：`service role key`（`createSupabaseServiceClient`）
4. 数据写入 Postgres，附件上传至 Storage bucket `problem-assets`。
5. 通过 `revalidatePath` 触发页面数据刷新，再 `redirect` 到目标页面。

## 4. 路由与权限模型

### 4.1 学生侧

- `/`：当前实现直接重定向到 `/student`。
- `/student`：栏目选择页。
- `/student/[subject]`：栏目题目列表，仅展示可见题目。
- `/problems/[id]?viewer=student`：题目详情 + 评论区（默认学生视角）。

### 4.2 老师侧

- `/teacher/login`：口令登录页；校验 `ADMIN_TOKEN`。
- 登录成功写入 `teacher_auth` Cookie（8 小时、httpOnly、sameSite=lax）。
- `/teacher`：栏目选择页（要求已登录）。
- `/teacher/[subject]`：栏目题目管理页（要求已登录）。
- `/teacher/problems/new`：发布题目（要求已登录）。
- `/teacher/problems/[id]/edit`：编辑题目（要求已登录）。
- `/problems/[id]?viewer=teacher`：老师视角详情页（要求已登录，展示编辑/治理入口）。

### 4.3 治理权限

- `hideProblemAction`、`hideCommentAction` 双重门槛：
  1) 必须是老师登录态；
  2) 提交的 `adminToken` 必须匹配 `ADMIN_TOKEN`。
- 治理行为写入 `moderation_events` 审计表。

## 5. 数据模型（已落库）

### 5.1 `problems`

- 核心字段：`subject`、`title`、`stem_md`、`options_json`、`answer_md`、`analysis_md`、`tags`、`difficulty`、`is_hidden`、`created_by_alias`、`author_user_id`、`created_at`
- 关键索引：
  - `idx_problems_visible_created_at`
  - `idx_problems_subject_visible_created_at`
  - `idx_problems_author_user_id`

### 5.2 `problem_assets`

- 字段：`problem_id`、`file_url`、`file_type(image|pdf)`、`sort_order`
- 索引：`idx_problem_assets_problem_id`

### 5.3 `comments`

- 字段：`problem_id`、`parent_id`、`author_role`、`author_alias`、`author_user_id`、`content_md`、`is_hidden`、`hidden_reason`、`created_at`
- 索引：
  - `idx_comments_problem_parent_created`
  - `idx_comments_author_user_id`

### 5.4 `moderation_events`

- 字段：`target_type`、`target_id`、`action`、`operator_alias`、`created_at`
- 索引：`idx_moderation_target`

## 6. 评论系统实现说明

- 顶层评论：服务端按页查询（每页 10 条）。
- 子回复：客户端在 `CommentNode` 内点击后调用 `/api/comments?problemId=...&parentId=...` 按需拉取。
- 发布评论：通过 `createCommentAction`（表单提交）落库；`/api/comments` 也保留了 POST 能力用于程序化调用。
- 当前治理入口只对顶层评论直接展示隐藏表单；子回复治理可在后续迭代补齐交互。

## 7. 环境变量与安全边界

- 必需变量：
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ADMIN_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY` 仅在服务端仓储写操作使用，不下发到客户端。
- 老师登录属于轻量口令方案，适合演示，不等价于正式 RBAC 鉴权。

## 8. 与“正式登录版本”的演进路线

1. 接入 Supabase Auth（或企业 SSO），替换 `teacher_auth` Cookie 口令模式。
2. 将 `parseIdentity` 从“表单别名输入”迁移为“会话身份注入”。
3. 将 `author_user_id` 从可空过渡为必填，并完成历史数据回填。
4. 把老师/治理权限下沉到 RLS + JWT Claims，减少 `service role` 写路径暴露面。
5. 为评论治理补充对子回复的完整管理入口与审计可视化。

