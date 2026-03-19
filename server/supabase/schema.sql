create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  profile_pic_url text default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  video_url text not null,
  thumbnail_url text default '',
  duration numeric default 0,
  views integer not null default 0,
  likes integer not null default 0,
  category text default 'General',
  uploaded_by uuid not null references public.users(id) on delete cascade,
  cloudinary_video_public_id text,
  cloudinary_thumbnail_public_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  comment text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  watched_at timestamptz not null default now()
);

create index if not exists idx_videos_uploaded_by on public.videos(uploaded_by);
create index if not exists idx_videos_category on public.videos(category);
create index if not exists idx_videos_created_at on public.videos(created_at desc);
create index if not exists idx_comments_video_id on public.comments(video_id);
create index if not exists idx_comments_created_at on public.comments(created_at desc);
create index if not exists idx_history_user_watched on public.watch_history(user_id, watched_at desc);

alter table public.users enable row level security;
alter table public.videos enable row level security;
alter table public.comments enable row level security;
alter table public.watch_history enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
for select using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
for update using (auth.uid() = id);

drop policy if exists "videos_read_all" on public.videos;
create policy "videos_read_all" on public.videos
for select using (true);

drop policy if exists "videos_insert_authenticated" on public.videos;
create policy "videos_insert_authenticated" on public.videos
for insert with check (auth.uid() = uploaded_by);

drop policy if exists "videos_update_owner" on public.videos;
create policy "videos_update_owner" on public.videos
for update using (auth.uid() = uploaded_by);

drop policy if exists "videos_delete_owner" on public.videos;
create policy "videos_delete_owner" on public.videos
for delete using (auth.uid() = uploaded_by);

drop policy if exists "comments_read_all" on public.comments;
create policy "comments_read_all" on public.comments
for select using (true);

drop policy if exists "comments_insert_authenticated" on public.comments;
create policy "comments_insert_authenticated" on public.comments
for insert with check (auth.uid() = user_id);

drop policy if exists "comments_update_owner" on public.comments;
create policy "comments_update_owner" on public.comments
for update using (auth.uid() = user_id);

drop policy if exists "comments_delete_owner" on public.comments;
create policy "comments_delete_owner" on public.comments
for delete using (auth.uid() = user_id);

drop policy if exists "history_select_own" on public.watch_history;
create policy "history_select_own" on public.watch_history
for select using (auth.uid() = user_id);

drop policy if exists "history_insert_own" on public.watch_history;
create policy "history_insert_own" on public.watch_history
for insert with check (auth.uid() = user_id);
