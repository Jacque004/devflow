import { Code2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { EmptyState } from '../../../components/shared/EmptyState'
import { LoadErrorCard } from '../../../components/shared/LoadErrorCard'
import { PageSectionSkeleton } from '../../../components/shared/PageSectionSkeleton'
import { useToast } from '../../../hooks/useToast'
import { supabase } from '../../../lib/supabase'
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'

type Snippet = {
  id: string
  title: string
  code: string
  language: string
  tags: string[] | null
}

export function SnippetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('typescript')
  const [tags, setTags] = useState('')
  const [query, setQuery] = useState('')
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null)
  const [snippetToDelete, setSnippetToDelete] = useState<Snippet | null>(null)
  const [visibleCount, setVisibleCount] = useState(10)
  const { pushToast } = useToast()

  const loadSnippets = async () => {
    setLoading(true)
    setLoadError(null)
    const { data, error } = await supabase
      .from('snippets')
      .select('id, title, code, language, tags')
      .order('created_at', { ascending: false })

    if (error) {
      pushToast('Impossible de charger les snippets', 'error')
      setLoadError('Impossible de charger les snippets.')
      setLoading(false)
      return
    }

    setVisibleCount(10)
    setSnippets(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void loadSnippets()
  }, [])

  const filteredSnippets = useMemo(() => {
    const lowerQuery = query.toLowerCase().trim()
    if (!lowerQuery) return snippets
    return snippets.filter((item) => {
      const inTitle = item.title.toLowerCase().includes(lowerQuery)
      const inCode = item.code.toLowerCase().includes(lowerQuery)
      const inTags = (item.tags ?? []).some((tag) => tag.toLowerCase().includes(lowerQuery))
      return inTitle || inCode || inTags
    })
  }, [query, snippets])

  const paginatedSnippets = useMemo(
    () => filteredSnippets.slice(0, visibleCount),
    [filteredSnippets, visibleCount],
  )

  const createSnippet = async () => {
    if (!title.trim() || !code.trim()) {
      pushToast('Titre et code sont requis', 'error')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      pushToast('Session expiree, reconnecte-toi', 'error')
      return
    }

    const parsedTags = tags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    const { error } = await supabase.from('snippets').insert({
      title: title.trim(),
      code: code.trim(),
      language: language.trim() || 'text',
      tags: parsedTags,
      user_id: user.id,
    })

    if (error) {
      pushToast("Erreur lors de l'ajout du snippet", 'error')
      return
    }

    pushToast('Snippet ajoute', 'success')
    setTitle('')
    setCode('')
    setLanguage('typescript')
    setTags('')
    setIsModalOpen(false)
    void loadSnippets()
  }

  const updateSnippet = async () => {
    if (!editingSnippet) return
    if (!title.trim() || !code.trim()) {
      pushToast('Titre et code sont requis', 'error')
      return
    }

    const parsedTags = tags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    const { error } = await supabase
      .from('snippets')
      .update({
        title: title.trim(),
        code: code.trim(),
        language: language.trim() || 'text',
        tags: parsedTags,
      })
      .eq('id', editingSnippet.id)

    if (error) {
      pushToast('Modification impossible', 'error')
      return
    }

    pushToast('Snippet modifie', 'success')
    setEditingSnippet(null)
    setTitle('')
    setCode('')
    setLanguage('typescript')
    setTags('')
    setIsModalOpen(false)
    void loadSnippets()
  }

  const deleteSnippet = async (id: string) => {
    const { error } = await supabase.from('snippets').delete().eq('id', id)
    if (error) {
      pushToast('Suppression impossible', 'error')
      return
    }
    pushToast('Snippet supprime', 'success')
    setSnippetToDelete(null)
    void loadSnippets()
  }

  const openCreateModal = () => {
    setEditingSnippet(null)
    setTitle('')
    setCode('')
    setLanguage('typescript')
    setTags('')
    setIsModalOpen(true)
  }

  const openEditModal = (snippet: Snippet) => {
    setEditingSnippet(snippet)
    setTitle(snippet.title)
    setCode(snippet.code)
    setLanguage(snippet.language)
    setTags((snippet.tags ?? []).join(', '))
    setIsModalOpen(true)
  }

  const onCopy = async (snippetCode: string) => {
    try {
      await navigator.clipboard.writeText(snippetCode)
      pushToast('Snippet copie dans le presse-papiers', 'success')
    } catch {
      pushToast('Copie impossible sur ce navigateur', 'error')
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Snippets</h1>
          <p className="muted">Retrouve rapidement ton code reutilisable.</p>
        </div>
        <button type="button" onClick={openCreateModal}>
          + Ajouter un snippet
        </button>
      </div>
      <input
        type="search"
        placeholder="Rechercher un snippet..."
        className="search-input"
        data-global-search="true"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {loading ? (
        <PageSectionSkeleton />
      ) : loadError ? (
        <LoadErrorCard message={loadError} onRetry={() => void loadSnippets()} />
      ) : paginatedSnippets.length > 0 ? (
        paginatedSnippets.map((snippet) => (
          <article key={snippet.id} className="card">
            <h2>{snippet.title}</h2>
            <p className="muted">{snippet.language}</p>
            <pre>{snippet.code}</pre>
            <div className="card-actions">
              <button type="button" className="ghost-btn" onClick={() => void onCopy(snippet.code)}>
                Copier
              </button>
              <button type="button" className="ghost-btn" onClick={() => openEditModal(snippet)}>
                Modifier
              </button>
              <button type="button" className="ghost-btn" onClick={() => setSnippetToDelete(snippet)}>
                Supprimer
              </button>
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          icon={Code2}
          title="Aucun snippet trouve"
          description="Ajoute ton premier snippet ou modifie ta recherche."
        />
      )}
      {filteredSnippets.length > paginatedSnippets.length ? (
        <button type="button" className="ghost-btn" onClick={() => setVisibleCount((prev) => prev + 10)}>
          Charger plus
        </button>
      ) : null}

      <Modal
        title={editingSnippet ? 'Modifier le snippet' : 'Nouveau snippet'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="form-grid">
          <input
            type="text"
            placeholder="Titre"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            type="text"
            placeholder="Langage (ex: typescript)"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          />
          <input
            type="text"
            placeholder="Tags separes par virgule"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
          <textarea
            className="text-area"
            placeholder="Code..."
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <button type="button" onClick={() => void (editingSnippet ? updateSnippet() : createSnippet())}>
            Enregistrer
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(snippetToDelete)}
        title="Supprimer ce snippet ?"
        message={`Cette action est definitive pour "${snippetToDelete?.title ?? ''}".`}
        confirmLabel="Supprimer"
        onCancel={() => setSnippetToDelete(null)}
        onConfirm={() => {
          if (!snippetToDelete) return
          void deleteSnippet(snippetToDelete.id)
        }}
      />
    </section>
  )
}
