# 概率论与数理统计 · 例题批量上传指南（Cursor Agent）

## 1. 任务

- 任务：将收到的教材例题图片，生成批量 `INSERT SQL`，交由我放到 Supabase 执行
- 数据落点：统一写入 `public.problems`，且 `subject = 'probability-statistics'`、`chapter_section = 'examples'`

## 2. 题号规则

- 格式：`例 章号.节号.题号`，如 `例 1.2.2` 表示第 1 章第 2 节第 2 道例题
- 存入 `question_no` 字段时保留"例 "前缀，如 `'例 1.2.2'`

## 3. 字段映射（固定）

- `question_no`：题号，格式 `例 章.节.题`（如 `例 1.2.2`）
- `title`：简短概括即可（概率论与数理统计栏目不展示 title，仅用题号 + 题干）
- `stem_md`：题目正文（即"例 x.x.x"后面的完整题干），含 LaTeX 公式请用 `$...$` / `$$...$$`
- `answer_md`：留空（`''`）。教材解析末尾自然包含结论/答案，无需单独拆分
- `analysis_md`：**完整解题过程，必须逐字忠实于教材原文**，不得改写、缩写或重新组织语句
- `options_json`：固定 `[]`
- `tags`：固定为 `一级题目`
- `difficulty`：根据题目判断 `easy` / `medium` / `hard`
- `created_by_alias`：固定 `ai-batch`

## 4. 含图题目

若题干或解析中包含几何图形、坐标系、示意图等，请转至 **`docs/PROBABILITY_FIGURES_GUIDE.md`** 执行，该文档描述了 SVG 生成 + 占位符 + 一键上传替换的完整流程。

## 5. LaTeX / Markdown 硬性规则

1. **禁止嵌套数学定界符**：`\text{}` 内部不得出现 `$...$`。若需在公式中嵌入中文说明，改为将文字放在公式外
2. **SQL 字符串使用真实换行**：PostgreSQL 普通字符串（`'...'`）中 `\n` 是两个字面字符，**不是**换行。必须在 SQL 中直接写多行字符串
3. **`$$` 必须独占行**：前端 `normalizeMathDelimiters` 会把单行 `$$expr$$` 转为行内 `$expr$`。Display math 格式应为：
   ```
   文字段落

   $$
   表达式
   $$

   下一段文字
   ```
4. **LaTeX 命令用单反斜杠**：PostgreSQL `standard_conforming_strings = on`（默认），`\frac` 直接存为 `\frac`；**不要**写 `\\frac`
5. **段落间用空行分隔**：一个空行 = Markdown 段落切换。连续文字只需一个空行即可分段
