import { FolderKanban } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { useToast } from '../../../hooks/useToast'
import { EmptyState } from '../../../components/shared/EmptyState'
import { LoadErrorCard } from '../../../components/shared/LoadErrorCard'
import { PageSectionSkeleton } from '../../../components/shared/PageSectionSkeleton'
import { supabase } from '../../../lib/supabase'
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'

type Project = {
  id: string
  name: string
  description: string | null
}

export function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const { pushToast } = useToast()

  const loadProjects = async () => {
    setLoading(true)
    setLoadError(null)
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, description')
      .order('created_at', { ascending: false })

    if (error) {
      pushToast("Impossible de charger les projets", 'error')
      setLoadError('Chargement impossible pour le moment.')
      setLoading(false)
      return
    }

    setProjects(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void loadProjects()
  }, [])

  const createProject = async () => {
    if (!projectName.trim()) {
      pushToast('Le nom du projet est requis', 'error')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      pushToast('Session expiree, reconnecte-toi', 'error')
      return
    }

    const { error } = await supabase.from('projects').insert({
      name: projectName.trim(),
      description: projectDescription.trim() || null,
      user_id: user.id,
    })

    if (error) {
      pushToast("Erreur lors de la creation du projet", 'error')
      return
    }

    pushToast('Projet cree', 'success')
    setProjectName('')
    setProjectDescription('')
    setIsModalOpen(false)
    void loadProjects()
  }

  const updateProject = async () => {
    if (!editingProject) return
    if (!projectName.trim()) {
      pushToast('Le nom du projet est requis', 'error')
      return
    }

    const { error } = await supabase
      .from('projects')
      .update({
        name: projectName.trim(),
        description: projectDescription.trim() || null,
      })
      .eq('id', editingProject.id)

    if (error) {
      pushToast('Modification impossible', 'error')
      return
    }

    pushToast('Projet modifie', 'success')
    setEditingProject(null)
    setProjectName('')
    setProjectDescription('')
    setIsModalOpen(false)
    void loadProjects()
  }

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      pushToast('Suppression impossible', 'error')
      return
    }
    pushToast('Projet supprime', 'success')
    setProjectToDelete(null)
    void loadProjects()
  }

  const openCreateModal = () => {
    setEditingProject(null)
    setProjectName('')
    setProjectDescription('')
    setIsModalOpen(true)
  }

  const openEditModal = (project: Project) => {
    setEditingProject(project)
    setProjectName(project.name)
    setProjectDescription(project.description ?? '')
    setIsModalOpen(true)
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Projets</h1>
          <p className="muted">Organise tes projets et suis leur progression.</p>
        </div>
        <button type="button" onClick={openCreateModal}>
          + Nouveau projet
        </button>
      </div>
      {loading ? (
        <PageSectionSkeleton />
      ) : loadError ? (
        <LoadErrorCard message={loadError} onRetry={() => void loadProjects()} />
      ) : projects.length > 0 ? (
        projects.map((project) => (
          <article key={project.id} className="card">
            <h2>{project.name}</h2>
            <p className="muted">{project.description ?? 'Sans description'}</p>
            <div className="card-actions">
              <Link className="inline-link" to={`/projects/${project.id}`}>
                Ouvrir le projet
              </Link>
              <button type="button" className="ghost-btn" onClick={() => openEditModal(project)}>
                Modifier
              </button>
              <button type="button" className="ghost-btn" onClick={() => setProjectToDelete(project)}>
                Supprimer
              </button>
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet pour le moment"
          description="Cree ton premier projet pour commencer a organiser tes taches."
        />
      )}

      <Modal
        title={editingProject ? 'Modifier le projet' : 'Nouveau projet'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="form-grid">
          <input
            type="text"
            placeholder="Nom du projet"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
          <textarea
            className="text-area"
            placeholder="Description (optionnel)"
            value={projectDescription}
            onChange={(event) => setProjectDescription(event.target.value)}
          />
          <button type="button" onClick={() => void (editingProject ? updateProject() : createProject())}>
            {editingProject ? 'Enregistrer' : 'Creer'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        title="Supprimer ce projet ?"
        message={`Cette action est definitive pour "${projectToDelete?.name ?? ''}".`}
        confirmLabel="Supprimer"
        onCancel={() => setProjectToDelete(null)}
        onConfirm={() => {
          if (!projectToDelete) return
          void deleteProject(projectToDelete.id)
        }}
      />
    </section>
  )
}
