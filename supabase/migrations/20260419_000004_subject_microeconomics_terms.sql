alter table public.problems
  drop constraint if exists problems_subject_check;

alter table public.problems
  add constraint problems_subject_check
  check (subject in ('probability-statistics', 'microeconomics', 'microeconomics-terms'));
