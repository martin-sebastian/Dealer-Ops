create table if not exists public.print_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  page_width_in numeric not null,
  page_height_in numeric not null,
  layout jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.print_templates enable row level security;

create policy "anon can read print templates"
  on public.print_templates for select to anon using (true);
create policy "anon can insert print templates"
  on public.print_templates for insert to anon with check (true);
create policy "anon can update print templates"
  on public.print_templates for update to anon using (true) with check (true);
create policy "anon can delete print templates"
  on public.print_templates for delete to anon using (true);

grant select, insert, update, delete on public.print_templates to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'print-images',
  'print-images',
  true,
  5242880,
  array['image/png','image/jpeg','image/webp','image/gif']
)
on conflict (id) do nothing;

create policy "anon can read print images"
  on storage.objects for select to anon
  using (bucket_id = 'print-images');
create policy "anon can upload print images"
  on storage.objects for insert to anon
  with check (bucket_id = 'print-images');
create policy "anon can update print images"
  on storage.objects for update to anon
  using (bucket_id = 'print-images')
  with check (bucket_id = 'print-images');
