-- ============================================
-- QubitLab Visualizer — Supabase Schema Setup
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. Saved circuits table
create table public.saved_circuits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.saved_circuits enable row level security;

create policy "Users can view own circuits"
  on public.saved_circuits for select
  using (auth.uid() = user_id);

create policy "Users can insert own circuits"
  on public.saved_circuits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own circuits"
  on public.saved_circuits for update
  using (auth.uid() = user_id);

create policy "Users can delete own circuits"
  on public.saved_circuits for delete
  using (auth.uid() = user_id);


-- 3. Circuit steps table
create table public.circuit_steps (
  id uuid primary key default gen_random_uuid(),
  circuit_id uuid not null references public.saved_circuits(id) on delete cascade,
  gate text not null,
  step_order integer not null
);

create index idx_circuit_steps_order on public.circuit_steps (circuit_id, step_order);

alter table public.circuit_steps enable row level security;

create policy "Users can view own circuit steps"
  on public.circuit_steps for select
  using (
    circuit_id in (
      select id from public.saved_circuits where user_id = auth.uid()
    )
  );

create policy "Users can insert own circuit steps"
  on public.circuit_steps for insert
  with check (
    circuit_id in (
      select id from public.saved_circuits where user_id = auth.uid()
    )
  );

create policy "Users can delete own circuit steps"
  on public.circuit_steps for delete
  using (
    circuit_id in (
      select id from public.saved_circuits where user_id = auth.uid()
    )
  );
