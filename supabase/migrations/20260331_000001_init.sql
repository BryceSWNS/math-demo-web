create extension if not exists pgcrypto;

create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  stem_md text not null,
  options_json jsonb not null default '[]'::jsonb,
  answer_md text not null default '',
  analysis_md text not null default '',
  tags text[] not null default '{}',
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')) default 'medium',
  status text not null default 'published',
  is_hidden boolean not null default false,
  created_by_alias text not null,
  author_user_id uuid null,
  created_at timestamptz not null default now()
);

create index if not exists idx_problems_visible_created_at
  on public.problems (is_hidden, created_at desc);

create index if not exists idx_problems_author_user_id
  on public.problems (author_user_id);

create table if not exists public.problem_assets (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  file_url text not null,
  file_type text not null check (file_type in ('image', 'pdf')),
  sort_order int not null default 0
);

create index if not exists idx_problem_assets_problem_id
  on public.problem_assets (problem_id, sort_order asc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  parent_id uuid null references public.comments(id) on delete cascade,
  author_role text not null check (author_role in ('teacher', 'student')),
  author_alias text not null,
  author_user_id uuid null,
  content_md text not null,
  is_hidden boolean not null default false,
  hidden_reason text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_comments_problem_parent_created
  on public.comments (problem_id, parent_id, created_at desc);

create index if not exists idx_comments_author_user_id
  on public.comments (author_user_id);

create table if not exists public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('problem', 'comment')),
  target_id uuid not null,
  action text not null check (action in ('hide', 'unhide')),
  operator_alias text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_moderation_target
  on public.moderation_events (target_type, target_id, created_at desc);

alter table public.problems enable row level security;
alter table public.problem_assets enable row level security;
alter table public.comments enable row level security;
alter table public.moderation_events enable row level security;

drop policy if exists problems_select_visible on public.problems;
create policy problems_select_visible on public.problems
  for select
  using (is_hidden = false);

drop policy if exists problem_assets_select_visible_problem on public.problem_assets;
create policy problem_assets_select_visible_problem on public.problem_assets
  for select
  using (
    exists (
      select 1
      from public.problems p
      where p.id = problem_id and p.is_hidden = false
    )
  );

drop policy if exists comments_select_visible on public.comments;
create policy comments_select_visible on public.comments
  for select
  using (
    is_hidden = false
    and exists (
      select 1
      from public.problems p
      where p.id = problem_id and p.is_hidden = false
    )
  );
