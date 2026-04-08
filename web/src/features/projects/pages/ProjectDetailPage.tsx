import { useEffect, useMemo, useState, type PointerEvent as PointerEventDom } from 'react'
import { useParams } from 'react-router-dom'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { CheckCircle2 } from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import { EmptyState } from '../../../components/shared/EmptyState'
import { LoadErrorCard } from '../../../components/shared/LoadErrorCard'
import { PageSectionSkeleton } from '../../../components/shared/PageSectionSkeleton'
import { useToast } from '../../../hooks/useToast'
import { supabase } from '../../../lib/supabase'
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'

type TaskStatus = 'todo' | 'in_progress' | 'done'
type TaskPriority = 'low' | 'medium' | 'high'

type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
}

type StatusColumnProps = {
  id: TaskStatus
  title: string
  tasks: Task[]
  onDelete: (taskId: string) => Promise<void>
  onChangeStatus: (taskId: string, status: TaskStatus) => Promise<void>
  onEdit: (task: Task) => void
}

function DraggableTask({
  task,
  onDelete,
  onChangeStatus,
  onEdit,
}: {
  task: Task
  onDelete: (taskId: string) => Promise<void>
  onChangeStatus: (taskId: string, status: TaskStatus) => Promise<void>
  onEdit: (task: Task) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.65 : 1,
  }

  const stopPointerForDrag = (event: PointerEventDom<HTMLDivElement>) => {
    event.stopPropagation()
  }

  return (
    <div ref={setNodeRef} style={style} className="task-item task-draggable" {...listeners} {...attributes}>
      <h3>{task.title}</h3>
      {task.description ? <p className="muted">{task.description}</p> : null}
      <p className="muted">Priorite: {task.priority}</p>
      <div className="card-actions" onPointerDownCapture={stopPointerForDrag}>
        {task.status === 'todo' ? (
          <button type="button" className="ghost-btn" onClick={() => void onChangeStatus(task.id, 'in_progress')}>
            Passer en cours
          </button>
        ) : null}
        {task.status === 'in_progress' ? (
          <>
            <button type="button" className="ghost-btn" onClick={() => void onChangeStatus(task.id, 'done')}>
              Passer termine
            </button>
            <button type="button" className="ghost-btn" onClick={() => void onChangeStatus(task.id, 'todo')}>
              Revenir a faire
            </button>
          </>
        ) : null}
        {task.status === 'done' ? (
          <button type="button" className="ghost-btn" onClick={() => void onChangeStatus(task.id, 'in_progress')}>
            Reouvrir
          </button>
        ) : null}
        <button type="button" className="ghost-btn" onClick={() => onEdit(task)}>
          Modifier
        </button>
        <button type="button" className="ghost-btn" onClick={() => void onDelete(task.id)}>
          Supprimer
        </button>
      </div>
    </div>
  )
}

function StatusColumn({ id, title, tasks, onDelete, onChangeStatus, onEdit }: StatusColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <article ref={setNodeRef} className={`card droppable-column${isOver ? ' is-over' : ''}`}>
      <h2>{title}</h2>
      {tasks.length === 0 ? (
        id === 'done' ? (
          <EmptyState
            icon={CheckCircle2}
            title="Aucune tache terminee"
            description="Les taches finalisees apparaitront ici."
          />
        ) : (
          <p className="muted">Aucune tache</p>
        )
      ) : (
        tasks.map((task) => (
          <DraggableTask
            key={task.id}
            task={task}
            onDelete={onDelete}
            onChangeStatus={onChangeStatus}
            onEdit={onEdit}
          />
        ))
      )}
    </article>
  )
}

export function ProjectDetailPage() {
  const { projectId } = useParams()
  const { pushToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string>('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | TaskPriority>('all')
  const [query, setQuery] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 12 },
    }),
  )

  const loadProjectData = async () => {
    if (!projectId) return

    setLoading(true)
    setLoadError(null)

    const [projectRes, tasksRes] = await Promise.all([
      supabase.from('projects').select('name').eq('id', projectId).single(),
      supabase
        .from('tasks')
        .select('id, title, description, status, priority')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }),
    ])

    if (projectRes.error || tasksRes.error) {
      setLoadError('Impossible de charger ce projet.')
      pushToast('Erreur de chargement du projet', 'error')
      setLoading(false)
      return
    }

    setProjectName(projectRes.data?.name ?? projectId)
    setTasks((tasksRes.data as Task[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void loadProjectData()
  }, [projectId])

  const tasksByStatus = useMemo(
    () => ({
      todo: tasks.filter((task) => task.status === 'todo'),
      inProgress: tasks.filter((task) => task.status === 'in_progress'),
      done: tasks.filter((task) => task.status === 'done'),
    }),
    [tasks],
  )

  const createTask = async () => {
    if (!projectId) return
    if (!title.trim()) {
      pushToast('Le titre de la tache est requis', 'error')
      return
    }

    const { error } = await supabase.from('tasks').insert({
      title: title.trim(),
      description: description.trim() || null,
      status: 'todo',
      priority,
      project_id: projectId,
    })

    if (error) {
      pushToast("Erreur lors de la creation de la tache", 'error')
      return
    }

    pushToast('Tache creee', 'success')
    setTitle('')
    setDescription('')
    setPriority('medium')
    setIsModalOpen(false)
    void loadProjectData()
  }

  const updateTask = async () => {
    if (!taskToEdit) return
    if (!title.trim()) {
      pushToast('Le titre de la tache est requis', 'error')
      return
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        title: title.trim(),
        description: description.trim() || null,
        priority,
      })
      .eq('id', taskToEdit.id)

    if (error) {
      pushToast('Modification impossible', 'error')
      return
    }

    pushToast('Tache modifiee', 'success')
    setTaskToEdit(null)
    setIsEditModalOpen(false)
    setTitle('')
    setDescription('')
    setPriority('medium')
    void loadProjectData()
  }

  const updateTaskStatus = async (taskId: string, nextStatus: TaskStatus) => {
    const previous = tasks
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task)))

    const { error } = await supabase.from('tasks').update({ status: nextStatus }).eq('id', taskId)
    if (error) {
      setTasks(previous)
      pushToast('Impossible de modifier le statut', 'error')
      return
    }
    pushToast('Statut mis a jour', 'success')
  }

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) {
      pushToast('Suppression impossible', 'error')
      return
    }
    pushToast('Tache supprimee', 'success')
    setTaskToDelete(null)
    void loadProjectData()
  }

  const openEditTaskModal = (task: Task) => {
    setTaskToEdit(task)
    setTitle(task.title)
    setDescription(task.description ?? '')
    setPriority(task.priority)
    setIsEditModalOpen(true)
  }

  const applyFilters = (list: Task[]) =>
    list.filter((task) => {
      const priorityMatch = statusFilter === 'all' || task.priority === statusFilter
      const queryMatch =
        !query.trim() ||
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        (task.description ?? '').toLowerCase().includes(query.toLowerCase())
      return priorityMatch && queryMatch
    })

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const taskId = String(active.id)
    const overId = String(over.id)

    let targetStatus: TaskStatus | null = null
    if (['todo', 'in_progress', 'done'].includes(overId)) {
      targetStatus = overId as TaskStatus
    } else {
      const otherTask = tasks.find((item) => item.id === overId)
      if (otherTask) targetStatus = otherTask.status
    }

    if (!targetStatus) return

    const task = tasks.find((item) => item.id === taskId)
    if (!task || task.status === targetStatus) return

    await updateTaskStatus(taskId, targetStatus)
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Projet: {projectName || projectId}</h1>
          <p className="muted">Kanban simplifie pour suivre tes taches.</p>
        </div>
        <button type="button" onClick={() => setIsModalOpen(true)}>
          + Nouvelle tache
        </button>
      </div>
      <div className="filter-row">
        <input
          type="search"
          className="search-input"
          placeholder="Rechercher une tache..."
          data-global-search="true"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className="select-input"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | TaskPriority)}
        >
          <option value="all">Toutes priorites</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {loading ? (
        <PageSectionSkeleton />
      ) : loadError ? (
        <LoadErrorCard message={loadError} onRetry={() => void loadProjectData()} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => void onDragEnd(event)}
        >
          <div className="kanban-grid">
            <StatusColumn
              id="todo"
              title="To Do"
              tasks={applyFilters(tasksByStatus.todo)}
              onDelete={async (id) => {
                const task = tasks.find((item) => item.id === id)
                if (task) setTaskToDelete(task)
              }}
              onChangeStatus={updateTaskStatus}
              onEdit={openEditTaskModal}
            />
            <StatusColumn
              id="in_progress"
              title="In Progress"
              tasks={applyFilters(tasksByStatus.inProgress)}
              onDelete={async (id) => {
                const task = tasks.find((item) => item.id === id)
                if (task) setTaskToDelete(task)
              }}
              onChangeStatus={updateTaskStatus}
              onEdit={openEditTaskModal}
            />
            <StatusColumn
              id="done"
              title="Done"
              tasks={applyFilters(tasksByStatus.done)}
              onDelete={async (id) => {
                const task = tasks.find((item) => item.id === id)
                if (task) setTaskToDelete(task)
              }}
              onChangeStatus={updateTaskStatus}
              onEdit={openEditTaskModal}
            />
          </div>
        </DndContext>
      )}

      <Modal title="Nouvelle tache" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="form-grid">
          <label className="field-label" htmlFor="task-title">
            Titre
          </label>
          <input
            id="task-title"
            type="text"
            placeholder="Titre de la tache"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <label className="field-label" htmlFor="task-description">
            Description
          </label>
          <textarea
            id="task-description"
            className="text-area"
            placeholder="Description optionnelle"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <label className="field-label" htmlFor="task-priority">
            Priorite
          </label>
          <select
            id="task-priority"
            className="select-input"
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button type="button" onClick={() => void createTask()}>
            Enregistrer
          </button>
        </div>
      </Modal>

      <Modal title="Modifier la tache" isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div className="form-grid">
          <label className="field-label" htmlFor="edit-task-title">
            Titre
          </label>
          <input
            id="edit-task-title"
            type="text"
            placeholder="Titre de la tache"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <label className="field-label" htmlFor="edit-task-description">
            Description
          </label>
          <textarea
            id="edit-task-description"
            className="text-area"
            placeholder="Description optionnelle"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <label className="field-label" htmlFor="edit-task-priority">
            Priorite
          </label>
          <select
            id="edit-task-priority"
            className="select-input"
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button type="button" onClick={() => void updateTask()}>
            Enregistrer
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        title="Supprimer cette tache ?"
        message={`Cette action est definitive pour "${taskToDelete?.title ?? ''}".`}
        confirmLabel="Supprimer"
        onCancel={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (!taskToDelete) return
          void deleteTask(taskToDelete.id)
        }}
      />
    </section>
  )
}
