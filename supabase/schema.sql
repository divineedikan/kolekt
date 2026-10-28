-- Kolekt cloud backup. Paste this whole file into Supabase > SQL Editor > New query > Run.
-- Each seller gets one profile row and one backup row. Row Level Security means a seller can only ever
-- read or write their own rows, even though the app's public key is visible in the browser.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  pro_until date,              -- set this by hand in Table Editor after you confirm a Pro payment
  note text,                   -- your own note, e.g. "paid ₦1,000 via Monnify 28 Oct"
  created_at timestamptz not null default now()
);

create table if not exists public.backups (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.backups enable row level security;

-- A seller can read their own profile (to see if Pro is active) but cannot change pro_until.
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (auth.uid() = id);

-- Backups: read and delete your own; write only while Pro is active.
drop policy if exists "read own backup" on public.backups;
create policy "read own backup" on public.backups for select using (auth.uid() = user_id);

drop policy if exists "insert own backup when pro" on public.backups;
create policy "insert own backup when pro" on public.backups for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.pro_until >= current_date)
  );

drop policy if exists "update own backup when pro" on public.backups;
create policy "update own backup when pro" on public.backups for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.pro_until >= current_date)
  );

drop policy if exists "delete own backup" on public.backups;
create policy "delete own backup" on public.backups for delete using (auth.uid() = user_id);

-- Create a profile automatically when someone signs in for the first time.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();
