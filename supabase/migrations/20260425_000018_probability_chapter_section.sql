-- 概率论与数理统计：新增章节分组字段（例题/习题）
-- 固定规则：页面分组仅依据 chapter_section 字段，不再做标题/标签推断。

alter table public.problems
add column if not exists chapter_section text;

update public.problems
set chapter_section = 'exercises'
where subject = 'probability-statistics'
  and chapter_section is null;

alter table public.problems
drop constraint if exists problems_chapter_section_check;

alter table public.problems
add constraint problems_chapter_section_check
check (chapter_section is null or chapter_section in ('examples', 'exercises'));

alter table public.problems
drop constraint if exists problems_probability_requires_chapter_section;

alter table public.problems
add constraint problems_probability_requires_chapter_section
check (subject <> 'probability-statistics' or chapter_section is not null);

create index if not exists idx_problems_subject_visible_chapter_section
  on public.problems (subject, is_hidden, chapter_no, chapter_section, item_no, created_at desc);
