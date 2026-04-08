-- Table des erreurs client (monitoring léger via Supabase)
-- Déjà incluse dans ../../supabase/migrations/20250408160000_initial_schema.sql
-- À exécuter seul dans le SQL Editor si tu ajoutes uniquement error_logs à un projet existant.

create extension if not exists pgcrypto;

create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  message text not null,
  stack text,
  context jsonb,
  url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_error_logs_user_created on public.error_logs (user_id, created_at desc);

alter table public.error_logs enable row level security;

drop policy if exists "error_logs_select_own" on public.error_logs;
drop policy if exists "error_logs_insert_own" on public.error_logs;

create policy "error_logs_select_own"
on public.error_logs
for select
to authenticated
using (auth.uid() = user_id);

create policy "error_logs_insert_own"
on public.error_logs
for insert
to authenticated
with check (auth.uid() = user_id);
