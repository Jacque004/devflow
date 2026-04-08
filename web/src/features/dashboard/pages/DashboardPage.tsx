import { useEffect, useState } from 'react'
import { Skeleton } from '../../../components/ui/Skeleton'
import { supabase } from '../../../lib/supabase'
import { useToast } from '../../../hooks/useToast'

type ActivityItem = {
  id: string
  type: 'project' | 'snippet' | 'journal'
  label: string
}

type DashboardCountsRow = {
  project_count: number | string
  tasks_in_progress: number | string
  tasks_done: number | string
}

function parseCount(value: number | string | undefined): number {
  if (value === undefined || value === null) return 0
  const n = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(n) ? n : 0
}

async function loadCountsWithFallback(): Promise<{
  projectCount: number
  inProgressCount: number
  doneCount: number
}> {
  const rpc = await supabase.rpc('dashboard_counts')

  if (!rpc.error && rpc.data && rpc.data.length > 0) {
    const row = rpc.data[0] as DashboardCountsRow
    return {
      projectCount: parseCount(row.project_count),
      inProgressCount: parseCount(row.tasks_in_progress),
      doneCount: parseCount(row.tasks_done),
    }
  }

  const [projectsRes, inProgressRes, doneRes] = await Promise.all([
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'done'),
  ])

  return {
    projectCount: projectsRes.count ?? 0,
    inProgressCount: inProgressRes.count ?? 0,
    doneCount: doneRes.count ?? 0,
  }
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [projectCount, setProjectCount] = useState(0)
  const [inProgressCount, setInProgressCount] = useState(0)
  const [doneCount, setDoneCount] = useState(0)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const { pushToast } = useToast()

  const loadDashboard = async () => {
    setLoading(true)
    setLoadError(null)

    const [counts, snippetsRes, journalRes] = await Promise.all([
      loadCountsWithFallback(),
      supabase.from('snippets').select('id, title').order('created_at', { ascending: false }).limit(3),
      supabase.from('journal_entries').select('id').order('created_at', { ascending: false }).limit(3),
    ])

    setProjectCount(counts.projectCount)
    setInProgressCount(counts.inProgressCount)
    setDoneCount(counts.doneCount)

    if (snippetsRes.error || journalRes.error) {
      setLoadError('Dashboard indisponible pour le moment.')
      pushToast('Certaines donnees du dashboard sont indisponibles', 'error')
    }

    const activityItems: ActivityItem[] = [
      ...(snippetsRes.data ?? []).map((item) => ({
        id: item.id,
        type: 'snippet' as const,
        label: `Snippet: ${item.title}`,
      })),
      ...(journalRes.data ?? []).map((item) => ({
        id: item.id,
        type: 'journal' as const,
        label: 'Nouvelle note de journal',
      })),
    ]
    setActivity(activityItems.slice(0, 5))
    setLoading(false)
  }

  useEffect(() => {
    void loadDashboard()
    const interval = window.setInterval(() => {
      void loadDashboard()
    }, 30000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Vue globale de ton activite sur DevFlow.</p>
        </div>
        <button type="button" className="ghost-btn" onClick={() => void loadDashboard()}>
          Rafraichir
        </button>
      </div>
      <div className="stats-grid">
        <article className="stat-card">
          <h2>Projets</h2>
          {loading ? <Skeleton height={34} /> : <p className="stat-value">{projectCount}</p>}
        </article>
        <article className="stat-card">
          <h2>Taches en cours</h2>
          {loading ? <Skeleton height={34} /> : <p className="stat-value">{inProgressCount}</p>}
        </article>
        <article className="stat-card">
          <h2>Taches terminees</h2>
          {loading ? <Skeleton height={34} /> : <p className="stat-value">{doneCount}</p>}
        </article>
      </div>
      <article className="card">
        <h2>Activite recente</h2>
        {loading ? (
          <Skeleton height={18} />
        ) : loadError ? (
          <>
            <p className="field-error">{loadError}</p>
            <button type="button" onClick={() => void loadDashboard()}>
              Reessayer
            </button>
          </>
        ) : activity.length > 0 ? (
          <ul className="activity-list">
            {activity.map((item) => (
              <li key={`${item.type}-${item.id}`} className="muted">
                {item.label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Aucune activite pour le moment. Cree un projet pour commencer.</p>
        )}
      </article>
    </section>
  )
}
