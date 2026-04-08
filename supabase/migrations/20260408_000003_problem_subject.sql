alter table public.problems
  add column if not exists subject text;

update public.problems
set subject = 'probability-statistics'
where subject is null;

alter table public.problems
  alter column subject set not null;

alter table public.problems
  drop constraint if exists problems_subject_check;

alter table public.problems
  add constraint problems_subject_check
  check (subject in ('probability-statistics', 'microeconomics'));

create index if not exists idx_problems_subject_visible_created_at
  on public.problems (subject, is_hidden, created_at desc);
