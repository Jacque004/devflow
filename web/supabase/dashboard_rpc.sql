-- Fonction RPC dashboard_counts (même contenu que ../../supabase/migrations/20250408160001_dashboard_counts_rpc.sql)
-- À exécuter dans le SQL Editor si le schéma existe déjà sans cette migration.

create or replace function public.dashboard_counts()
returns table (
  project_count bigint,
  tasks_in_progress bigint,
  tasks_done bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    (select count(*)::bigint from public.projects where user_id = auth.uid()),
    (select count(*)::bigint
     from public.tasks t
     inner join public.projects p on p.id = t.project_id
     where p.user_id = auth.uid() and t.status = 'in_progress'),
    (select count(*)::bigint
     from public.tasks t
     inner join public.projects p on p.id = t.project_id
     where p.user_id = auth.uid() and t.status = 'done');
$$;

grant execute on function public.dashboard_counts() to authenticated;
