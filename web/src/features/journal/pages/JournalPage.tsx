import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { EmptyState } from '../../../components/shared/EmptyState'
import { LoadErrorCard } from '../../../components/shared/LoadErrorCard'
import { PageSectionSkeleton } from '../../../components/shared/PageSectionSkeleton'
import { Modal } from '../../../components/ui/Modal'
import { useToast } from '../../../hooks/useToast'
import { supabase } from '../../../lib/supabase'
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'

type JournalEntry = {
  id: string
  content: string
  created_at: string
}

export function JournalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [content, setContent] = useState('')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null)
  const { pushToast } = useToast()

  const loadEntries = async () => {
    setLoading(true)
    setLoadError(null)
    const { data, error } = await supabase
      .from('journal_entries')
      .select('id, content, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      pushToast('Impossible de charger le journal', 'error')
      setLoadError('Le journal est temporairement indisponible.')
      setLoading(false)
      return
    }

    setEntries(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void loadEntries()
  }, [])

  const addEntry = async () => {
    if (!content.trim()) {
      pushToast('Le contenu de la note est requis', 'error')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      pushToast('Session expiree, reconnecte-toi', 'error')
      return
    }

    const { error } = await supabase.from('journal_entries').insert({
      content: content.trim(),
      user_id: user.id,
    })

    if (error) {
      pushToast("Erreur lors de l'ajout de la note", 'error')
      return
    }

    pushToast('Note ajoutee', 'success')
    setContent('')
    setIsModalOpen(false)
    void loadEntries()
  }

  const updateEntry = async () => {
    if (!editingEntry) return
    if (!content.trim()) {
      pushToast('Le contenu de la note est requis', 'error')
      return
    }

    const { error } = await supabase
      .from('journal_entries')
      .update({ content: content.trim() })
      .eq('id', editingEntry.id)

    if (error) {
      pushToast('Modification impossible', 'error')
      return
    }

    pushToast('Note modifiee', 'success')
    setEditingEntry(null)
    setContent('')
    setIsModalOpen(false)
    void loadEntries()
  }

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id)
    if (error) {
      pushToast('Suppression impossible', 'error')
      return
    }
    pushToast('Note supprimee', 'success')
    setEntryToDelete(null)
    void loadEntries()
  }

  const openCreateModal = () => {
    setEditingEntry(null)
    setContent('')
    setIsModalOpen(true)
  }

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setContent(entry.content)
    setIsModalOpen(true)
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Journal</h1>
          <p className="muted">Note ce que tu as fait chaque jour.</p>
        </div>
        <button type="button" onClick={openCreateModal}>
          + Nouvelle note
        </button>
      </div>
      {loading ? (
        <PageSectionSkeleton />
      ) : loadError ? (
        <LoadErrorCard message={loadError} onRetry={() => void loadEntries()} />
      ) : entries.length > 0 ? (
        entries.map((entry) => (
          <article key={entry.id} className="card">
            <h2>{new Date(entry.created_at).toLocaleDateString('fr-FR')}</h2>
            <p className="muted">{entry.content}</p>
            <div className="card-actions">
              <button type="button" className="ghost-btn" onClick={() => openEditModal(entry)}>
                Modifier
              </button>
              <button type="button" className="ghost-btn" onClick={() => setEntryToDelete(entry)}>
                Supprimer
              </button>
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Aucune note encore"
          description="Ajoute une premiere note pour suivre ton avancement quotidien."
        />
      )}

      <Modal
        title={editingEntry ? 'Modifier la note' : 'Nouvelle note'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="form-grid">
          <textarea
            className="text-area"
            placeholder="Ce que tu as fait aujourd'hui..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <button type="button" onClick={() => void (editingEntry ? updateEntry() : addEntry())}>
            Enregistrer
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(entryToDelete)}
        title="Supprimer cette note ?"
        message="Cette action est definitive."
        confirmLabel="Supprimer"
        onCancel={() => setEntryToDelete(null)}
        onConfirm={() => {
          if (!entryToDelete) return
          void deleteEntry(entryToDelete.id)
        }}
      />
    </section>
  )
}
