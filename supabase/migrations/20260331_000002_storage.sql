insert into storage.buckets (id, name, public)
values ('problem-assets', 'problem-assets', true)
on conflict (id) do nothing;

drop policy if exists problem_assets_public_read on storage.objects;
create policy problem_assets_public_read on storage.objects
  for select
  using (bucket_id = 'problem-assets');
