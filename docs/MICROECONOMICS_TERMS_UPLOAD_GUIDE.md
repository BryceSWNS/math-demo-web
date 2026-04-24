# 微观名词解释批量上传指南（Cursor Agent）

## 1. 任务

- 任务：将收到的题目图片，生成批量 `INSERT SQL` ，交由我放到Supabase执行
- 数据落点：统一写入 `public.problems`，且 `subject = 'microeconomics-terms'`。

## 2. 字段映射（固定）

- `question_no`：题号，格式固定 `章号.题号`（如 `1.1`、`12.11`）。
- `title`：术语名（如“理性人假设”）。
- `stem_md`：对名词解释部分的概括，不放解释和案例正文
- `answer_md`：名词解释正文。
- `analysis_md`：案例正文。
- `options_json`：固定 `[]`。
- `difficulty`：默认 `medium`。
- `created_by_alias`：固定 `ai-batch`
