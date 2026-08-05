-- Shared WorkoutX response cache (demand-driven; served via Edge Function).
-- Clients never need to call WorkoutX directly for lists/details/GIFs once warm.

create table if not exists public.wx_cache (
  cache_key text primary key,
  kind text not null check (kind in ('page', 'exercise', 'gif')),
  payload jsonb,
  storage_path text,
  content_type text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists wx_cache_kind_idx on public.wx_cache (kind);
create index if not exists wx_cache_expires_idx on public.wx_cache (expires_at);

alter table public.wx_cache enable row level security;

-- App users can read cache rows (optional; Edge Function uses service role).
drop policy if exists "wx_cache_select_authenticated" on public.wx_cache;
create policy "wx_cache_select_authenticated"
  on public.wx_cache for select
  to authenticated
  using (true);

-- Writes only via service role (Edge Function) — no insert/update policies for anon/auth.

-- Public bucket for cached GIFs (URLs safe to put in <Image>; no WorkoutX key).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wx-gifs',
  'wx-gifs',
  true,
  5242880,
  array['image/gif', 'image/webp', 'image/png', 'image/jpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "wx_gifs_public_read" on storage.objects;
create policy "wx_gifs_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'wx-gifs');

-- Uploads only via service role from Edge Function (no client write policy).
