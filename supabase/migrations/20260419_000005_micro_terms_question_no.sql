alter table public.problems
  add column if not exists question_no text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'problems_question_no_format'
      and conrelid = 'public.problems'::regclass
  ) then
    alter table public.problems
      add constraint problems_question_no_format
      check (question_no is null or question_no ~ '^\d+\.\d+$');
  end if;
end $$;

alter table public.problems
  add column if not exists chapter_no int generated always as (
    case
      when question_no is null then null
      else split_part(question_no, '.', 1)::int
    end
  ) stored;

alter table public.problems
  add column if not exists item_no int generated always as (
    case
      when question_no is null then null
      else split_part(question_no, '.', 2)::int
    end
  ) stored;

create index if not exists idx_problems_subject_visible_question_no
  on public.problems (subject, is_hidden, chapter_no asc, item_no asc, created_at desc);
