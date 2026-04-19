# DEV LOG - 乐湖华研题库（2.0+）

## 记录说明

- 本文件从 `version 2.0` 开始，持续记录后续工程演进。
- `2.0` 之前历史已归档至 `docs/DEV_LOG1.md`。
- 建议每次功能改动按“背景 -> 变更 -> 风险/待办”格式记录。

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
