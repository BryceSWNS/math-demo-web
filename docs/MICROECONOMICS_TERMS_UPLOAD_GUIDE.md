# 微观名词解释批量上传指南（Cursor Agent）

## 1. 任务

- 任务：将收到的题目图片，批量写入 Supabase。
- 数据落点：统一写入 `public.problems`，且 `subject = 'microeconomics-terms'`。

## 2. 字段映射（固定）

- `title`：术语名（如“理性人假设”）。
- `stem_md`：概念标题块（简短，不放解释和案例正文）。
- `answer_md`：名词解释正文。
- `analysis_md`：案例正文。
- `options_json`：固定 `[]`。
- `difficulty`：默认 `medium`。
- `created_by_alias`：固定 `ai-batch`

## 3. 批量执行流程（两阶段）

1. 先输出结构化 `JSON` 数组（不直接写库）。
2. 我确认 `JSON` 后，再生成批量 `INSERT SQL`。
3. 告诉我在 Supabase SQL Editor 执行该 SQL的方法
