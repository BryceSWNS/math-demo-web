# DEV LOG - 乐湖华研题库（2.0+）

## 记录说明

- 本文件从 `version 2.0` 开始，持续记录后续工程演进。
- `2.0` 之前历史已归档至 `docs/DEV_LOG1.md`。
- 建议每次功能改动按“背景 -> 变更 -> 风险/待办”格式记录。

---

## 2026-04-25

## 2026-04-26

### 含图题目：一体化上传流程与指南
- **背景**：概率论部分题目（如几何概型）题干或解析包含坐标系、示意图，纯 SQL 录入无法携带图片，需要一套自动化方案处理图形上传与引用。
- **变更**：
  1. 新增 `scripts/upload-figures.sh`：自动加载 `.env.local`，扫描 SQL 中 `{{FIG:文件名}}` 占位符，将 `figures/` 目录对应 SVG 上传到 Supabase Storage（`problem-assets/figures/`），替换占位符为 public URL，并备份原始 SQL。
  2. 新增 `docs/PROBABILITY_FIGURES_GUIDE.md`：面向 AI 的含图题目完整处理指南，包含 SVG 规范（尺寸、填充、标注）、占位符写法、脚本用法。
  3. `docs/PROBABILITY_EXAMPLES_UPLOAD_GUIDE.md` 新增第 4 节分流说明，含图题目指向新文档。
- **风险/待办**：Supabase Storage bucket `problem-assets` 需为 public 才能通过 URL 直接访问；`MarkdownMath` 组件 `react-markdown` 默认支持 `![](url)` 渲染 `<img>`，无需额外配置。

### 概率论与数理统计：修复例 1.2.3 的内容与渲染
- **背景**：迁移 `000021` 存在三类问题：① 解析内容被大幅改写，未忠实教材原文；② `answer_md` / `analysis_md` 分离，但教材解析末尾自带结论，拆分后答案与解析重复；③ SQL 中 `\n\n` 是字面文本而非换行，且单行 `$$...$$` 被 `normalizeMathDelimiters` 转成行内公式，渲染全部挤到一行。
- **变更**：
  1. 重写 `000021`：`analysis_md` 逐字对照教材原文（含分步推导 $A_0 \to A_1 \to A_m$、数值示例、结论），使用 PostgreSQL 多行字符串（真实换行）取代 `\n\n`，`$$` 独占行以保持 display math，`answer_md` 置空。
  2. 重写 `000022`（UPDATE 补丁），对已入库数据执行同样修复。
- **要点**：后续录题需遵守——① 禁止在 `\text{}` 内嵌套 `$...$`；② SQL 字符串用真实换行；③ `$$` 必须独占行（否则会被前端 normalize 为行内公式）；④ 解析应忠实原文，不得改写。

### 概率论与数理统计：移除 title 冗余展示，卡片标题仅显示题号
- **背景**：概率论例题卡片同时显示 `questionNo + title` 和 `stemMd`，而 `title` 与 `stemMd` 内容基本相同，造成视觉重复。
- **变更**：
  1. 学生/老师 section 列表页卡片标题改为仅显示 `questionNo`（无题号时降级为 `title`），`stemMd` 作为内容区展示。
  2. `ProblemDetail` 详情页标题对概率论仅显示 `questionNo`。
  3. `ProblemForm` 对概率论隐藏标题输入框（`hidden` 字段保留旧值）。
  4. `createProblemAction` / `updateProblemAction` 在 `title` 为空时自动从 `stemMd` 截取填充，确保 DB 非空约束。
  5. 上传指南 `PROBABILITY_EXAMPLES_UPLOAD_GUIDE.md` 同步更新 `title` 字段说明。
- **风险/待办**：其他栏目（微观经济学、微观名词解释）不受影响，继续使用 `questionNo + title` 展示。

---

### 概率论与数理统计：题号体系升级（三段式 +“例”前缀）
- **背景**：概率论习题编号为 `1.1.1`（章.节.题），例题编号为 `例 1.1.1`，数字部分可能与习题重复，靠“例 ”前缀区分；原 `question_no` 约束 `^\d+\.\d+$` 无法容纳。
- **变更**：
  1. 新增迁移 `20260425_000019_probability_question_no_format.sql`：放宽 `problems_question_no_format` 约束为 `^\d+\.\d+$` | `^(例 )?\d+\.\d+\.\d+$`；删除旧 `chapter_no`/`item_no` 生成列，以 `regexp_replace` 重建，兼容“例”前缀；新增 `sub_item_no` 生成列（第三段，两段式为 NULL）；重建相关索引。
  2. `subjects.ts` 中 `parseQuestionNo` 扩展为支持两段/三段（含“例”前缀），返回 `{chapterNo, itemNo, subItemNo?}`。
  3. `problems.ts` 仓储层 `questionNo` Zod regex 放宽；`SUMMARY_COLUMNS` 追加 `sub_item_no`。
  4. 学生/老师 section 页排序改为先 `itemNo` 再 `subItemNo`。
  5. 新增 `docs/PROBABILITY_EXAMPLES_UPLOAD_GUIDE.md`，面向 AI 的概率论例题批量入库指南。
- **风险/待办**：微观名词解释仍使用两段式题号，互不干扰；概率论习题上传指南待后续补充。
---

### 概率论与数理统计：章节下拆分“例题/习题”并切换为字段判定
- **背景**：该栏目需要每章分成“例题、习题”两块，并且分组判定需基于固定字段规则，避免关键词推断造成偏差。
- **变更**：
  1. 新增迁移 `20260425_000018_probability_chapter_section.sql`，为 `problems` 增加 `chapter_section` 字段，并约束概率论栏目必须填写 `examples/exercises`。
  2. `ProblemForm` 新增“题型（概率论与数理统计必填）”下拉，发布/编辑时通过 Server Action 传入仓储层写库。
  3. `student/[subject]`、`teacher/[subject]` 在概率论章节卡片下直接展示“例题/习题”入口与数量。
  4. `student/[subject]/chapter/[chapterNo]`、`teacher/[subject]/chapter/[chapterNo]` 调整为章节分组页；新增 `.../[section]` 分组题目列表页。
  5. 章节分组统计与列表筛选改为仅依据 `chapter_section` 字段，不再使用标题/标签关键词规则。
  6. `createProblemAction` / `updateProblemAction` 补充分组页 `revalidatePath`，确保发布/编辑后分组列表实时刷新。
- **风险/待办**：本次迁移对既有概率论数据默认回填为 `exercises`；若历史数据需要区分例题，可后续批量修正 `chapter_section`。

---

### 概率论与数理统计：栏目改为“先章节后题目”的两级导航
- **背景**：栏目入口需要先展示章节列表，再进入章节内题目，避免直接平铺全部题目。
- **变更**：
  1. `student/[subject]`、`teacher/[subject]` 对 `probability-statistics` 切换为章节列表展示，章节来源于 `SUBJECT_CHAPTERS`。
  2. 新增路由 `student/[subject]/chapter/[chapterNo]` 与 `teacher/[subject]/chapter/[chapterNo]`，用于展示分章题目列表。
  3. 章节页题目按题号 `章号.题号` 解析后按题号升序显示；无题目时给出空态文案。
  4. `createProblemAction` / `updateProblemAction` 新增章节页 `revalidatePath`，保证发布/编辑后章节列表与分章页同步刷新。
- **风险/待办**：当前分章筛选依赖 `question_no` 的 `章号.题号` 格式；若录入不规范（为空或非法）将不会归入章节页。

---

### 概率论与数理统计：章节元数据补齐（第 1 章 - 第 7 章）
- **背景**：该栏目需要固定章节标题，用于按章录题与后续章节化展示。
- **变更**：在 `src/lib/domain/subjects.ts` 新增 `SUBJECT_CHAPTERS` 配置，补齐“概率论与数理统计”第 1 至第 7 章标题；在 `docs/PROBLEM_UPLOAD_GUIDE.md` 同步章节清单。
- **风险/待办**：当前仅完成领域层与文档配置，若后续需要在页面中按章节筛选/导航，可直接复用该配置继续实现前端交互。

---

### 前端性能优化：消除路由切换与列表滚动卡顿
- **背景**：点击栏目进入列表、进入详情/评论、列表上下滚动时均存在明显卡顿。根因为：列表页 `select(*)` 拉全量重字段 + 一次性渲染全部 KaTeX 公式 + 详情页阻塞等待评论区查询完成 + 无路由级加载骨架屏。
- **变更**：
  1. 新增 `loading.tsx` 骨架屏（`/student/[subject]`、`/teacher/[subject]`、`/problems/[id]`），路由切换时立即展示占位动画，消除白屏等待。
  2. 题目详情页 `CommentSection` 由 `<Suspense>` 包裹，题目正文先到即先出，评论区异步流式填充。
  3. 新增 `LazyMarkdownMath` 组件（IntersectionObserver + 200px rootMargin），列表卡片中的 Markdown/公式仅在进入视口时才挂载渲染。
  4. 仓储层新增 `listVisibleProblemSummariesBySubject`，列表页只查 9 个轻字段（不含 `answer_md`/`analysis_md`/`options_json`）；详情页保持完整查询不变。
  5. 领域层新增 `ProblemSummary` 类型（`Pick<ProblemRecord, ...>`）供列表页使用。
  6. `globals.css` 新增骨架屏脉冲动画样式。
  7. `architecture.md` 3.1 节补充前端性能策略说明。
- **风险/待办**：`listVisibleProblemsBySubject`（全字段）仍保留供需要完整数据的场景使用；若后续列表页内容需求变化需同步调整 `SUMMARY_COLUMNS`。

---

## 2026-04-19（晚）

### 微观名词解释：题号字段与排序试点
- **背景**：栏目内题目在页面按创建时间展示，无法满足按题号（如 `1.1`、`12.11`）阅读与复习的顺序需求。
- **变更**：新增迁移 `20260419_000005_micro_terms_question_no.sql`，在 `problems` 增加 `question_no` 及生成列 `chapter_no`/`item_no`，并加索引 `idx_problems_subject_visible_question_no`；题目发布/编辑表单新增题号输入，仓储层新增格式校验（`^\d+\.\d+$`）且要求 `microeconomics-terms` 必填；学生端/老师端栏目列表与详情标题展示题号；`microeconomics-terms` 列表改为按 `chapter_no`、`item_no` 升序（再按 `created_at` 兜底）排序。
- **补充**：新增迁移 `20260419_000006_backfill_micro_terms_question_no.sql`，仅对 `microeconomics-terms` 且 `question_no` 为空的数据执行回填，按 `created_at asc`（并以 `id` 打破并列）依次写入 `1.1`、`1.2`、`1.3`...，用于历史数据一次性排齐。
- **风险/待办**：当前表单“题号必填”前端校验仅在初始栏目为 `microeconomics-terms` 时生效，切换栏目场景依赖服务端兜底校验；后续可做按栏目动态必填提示。

---

## 2026-04-19（下午）

### 微观名词解释：概念优先 + 折叠展示与上传规范文档
- **背景**：该栏目条目含概念、名词解释、案例三块，需学生先见概念，展开后再读解释与案例；并需供 AI 按图识别上传。
- **变更**：`ProblemDetail` 在 `subject === microeconomics-terms` 时将题干区标题改为「概念」、折叠区改为「名词解释与案例」，块内小标题为「名词解释」「案例」；新增 `docs/MICROECONOMICS_TERMS_UPLOAD_GUIDE.md`；`PROBLEM_UPLOAD_GUIDE.md` 增加栏目分流与发布路径说明；`architecture.md` 5.1 补充该栏位语义说明。后续将 `MICROECONOMICS_TERMS_UPLOAD_GUIDE.md` 收敛为仅面向 AI 的精简规则。
- **风险/待办**：老师表单仍显示「答案」「解析」字段名，依赖文档与习惯对应到名词解释/案例；若需可在表单按栏目切换文案。
- **数据**：迁移 `20260419_000005_seed_microeconomics_terms_rational_man.sql` 写入「微观名词解释」首条（理性人假设），字段映射遵循 `MICROECONOMICS_TERMS_UPLOAD_GUIDE.md`。

---

## 2026-04-19

### 栏目：新增「微观名词解释」
- **背景**：题库需与「概率论与数理统计」「微观经济学」并列的第三栏目，用于微观术语释义类题目。
- **变更**：在 `src/lib/domain/subjects.ts` 增加 slug `microeconomics-terms` 及中文标签；学生/老师首页入口与 `ProblemForm` 栏目下拉同步；`ProblemSubject` 与 Zod 校验改为以 `SUBJECTS` 为单一来源；`createProblemAction` / `updateProblemAction` 按全部栏目循环 `revalidatePath`；新增迁移 `20260419_000004_subject_microeconomics_terms.sql` 放宽 `problems_subject_check`；首页卡片布局使用 `grid-3`。
- **风险/待办**：已有数据库需执行该迁移，否则写入新栏目会触发 check 约束失败。

---

## 2026-04-12

### 题目详情：答案与解析默认折叠
- **背景**：学生打开题目详情时，答案与解析直接展示，影响自测体验。
- **变更**：在 `ProblemDetail` 中用单个 `<details>` 包裹答案与解析内容，默认折叠；用户点击摘要「答案」展开后，才渲染可见区域内的答案正文与解析正文（原生 disclosure，无需客户端状态）。
- **风险/待办**：若未来需要「只展开答案、解析仍单独折叠」，需改为分块折叠或客户端组件。

---

## 2026-04-08

### Step 1 - 文档基线重建（2.0 起点）
- 以当前代码实现为准重写 `architecture.md`，同步路由结构、老师鉴权、评论与治理链路。
- 原 `docs/DEV_LOG.md` 归档为 `docs/DEV_LOG1.md`，保留 2.0 前全部历史。
- 新建本文件作为 2.0 后续开发日志起点。

### Backlog（待后续持续更新）
- [ ] 将老师口令登录升级为标准会话鉴权（Supabase Auth / SSO）。
- [ ] 评论治理能力下沉到子回复层级，补齐 UI 入口。
- [ ] 评估将治理权限收敛到 RLS + claims，减少 service role 写路径。
