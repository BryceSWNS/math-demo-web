-- 放宽 question_no 约束，支持概率论与数理统计三段式编号（含"例"前缀）
-- 原格式：^\d+\.\d+$（微观名词解释 1.1）
-- 新增格式：^(例 )?\d+\.\d+\.\d+$（概率论习题 1.1.1 / 例题 例 1.1.1）

-- 1. 替换题号格式约束
alter table public.problems drop constraint if exists problems_question_no_format;

alter table public.problems
add constraint problems_question_no_format
check (
  question_no is null
  or question_no ~ '^\d+\.\d+$'
  or question_no ~ '^(例 )?\d+\.\d+\.\d+$'
);

-- 2. 删除依赖生成列的索引
drop index if exists idx_problems_subject_visible_question_no;
drop index if exists idx_problems_subject_visible_chapter_section;

-- 3. 删除旧生成列
alter table public.problems drop column if exists chapter_no;
alter table public.problems drop column if exists item_no;

-- 4. 重建生成列（regexp_replace 统一剥离"例 "前缀再拆分）
alter table public.problems
add column chapter_no int generated always as (
  case when question_no is null then null
  else split_part(regexp_replace(question_no, '^例\s*', ''), '.', 1)::int
  end
) stored;

alter table public.problems
add column item_no int generated always as (
  case when question_no is null then null
  else split_part(regexp_replace(question_no, '^例\s*', ''), '.', 2)::int
  end
) stored;

-- 5. 新增第三段生成列（仅三段式有值，两段式为 NULL）
alter table public.problems
add column sub_item_no int generated always as (
  case when question_no is null then null
  when split_part(regexp_replace(question_no, '^例\s*', ''), '.', 3) = '' then null
  else split_part(regexp_replace(question_no, '^例\s*', ''), '.', 3)::int
  end
) stored;

-- 6. 重建索引（包含 sub_item_no）
create index idx_problems_subject_visible_question_no
  on public.problems (subject, is_hidden, chapter_no asc, item_no asc, sub_item_no asc nulls last, created_at desc);

create index idx_problems_subject_visible_chapter_section
  on public.problems (subject, is_hidden, chapter_no, chapter_section, item_no, sub_item_no nulls last, created_at desc);
