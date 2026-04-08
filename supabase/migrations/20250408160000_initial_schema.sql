-- DevFlow — schéma initial (tables + RLS + error_logs)
-- Appliqué via : supabase db push (projet lié) ou copie dans le SQL Editor.

create extension if not exists pgcrypto;

-- ——— Projets ———
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_user_created on public.projects (user_id, created_at desc);

-- ——— Tâches (Kanban) ———
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);

create index if not exists idx_tasks_project on public.tasks (project_id);
create index if not exists idx_tasks_project_status on public.tasks (project_id, status);
create index if not exists idx_tasks_created on public.tasks (created_at desc);

-- ——— Snippets ———
create table if not exists public.snippets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  code text not null,
  language text not null default 'text',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_snippets_user_created on public.snippets (user_id, created_at desc);

-- ——— Journal ———
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_journal_user_created on public.journal_entries (user_id, created_at desc);

-- ——— error_logs (monitoring client) ———
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

-- ——— Row Level Security ———
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.snippets enable row level security;
alter table public.journal_entries enable row level security;
alter table public.error_logs enable row level security;

drop policy if exists "projects_select_own" on public.projects;
drop policy if exists "projects_insert_own" on public.projects;
drop policy if exists "projects_update_own" on public.projects;
drop policy if exists "projects_delete_own" on public.projects;

create policy "projects_select_own"
  on public.projects for select to authenticated
  using (auth.uid() = user_id);

create policy "projects_insert_own"
  on public.projects for insert to authenticated
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.projects for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "projects_delete_own"
  on public.projects for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "tasks_select_via_project" on public.tasks;
drop policy if exists "tasks_insert_via_project" on public.tasks;
drop policy if exists "tasks_update_via_project" on public.tasks;
drop policy if exists "tasks_delete_via_project" on public.tasks;

create policy "tasks_select_via_project"
  on public.tasks for select to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id and p.user_id = auth.uid()
    )
  );

create policy "tasks_insert_via_project"
  on public.tasks for insert to authenticated
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "tasks_update_via_project"
  on public.tasks for update to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id and p.user_id = auth.uid()
    )
  );

create policy "tasks_delete_via_project"
  on public.tasks for delete to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "snippets_select_own" on public.snippets;
drop policy if exists "snippets_insert_own" on public.snippets;
drop policy if exists "snippets_update_own" on public.snippets;
drop policy if exists "snippets_delete_own" on public.snippets;

create policy "snippets_select_own"
  on public.snippets for select to authenticated
  using (auth.uid() = user_id);

create policy "snippets_insert_own"
  on public.snippets for insert to authenticated
  with check (auth.uid() = user_id);

create policy "snippets_update_own"
  on public.snippets for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "snippets_delete_own"
  on public.snippets for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "journal_select_own" on public.journal_entries;
drop policy if exists "journal_insert_own" on public.journal_entries;
drop policy if exists "journal_update_own" on public.journal_entries;
drop policy if exists "journal_delete_own" on public.journal_entries;

create policy "journal_select_own"
  on public.journal_entries for select to authenticated
  using (auth.uid() = user_id);

create policy "journal_insert_own"
  on public.journal_entries for insert to authenticated
  with check (auth.uid() = user_id);

create policy "journal_update_own"
  on public.journal_entries for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "journal_delete_own"
  on public.journal_entries for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "error_logs_select_own" on public.error_logs;
drop policy if exists "error_logs_insert_own" on public.error_logs;

create policy "error_logs_select_own"
  on public.error_logs for select to authenticated
  using (auth.uid() = user_id);

create policy "error_logs_insert_own"
  on public.error_logs for insert to authenticated
  with check (auth.uid() = user_id);
