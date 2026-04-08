import type { ReactNode } from 'react'
import { useEffect, useId, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

type ModalProps = {
  title: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, isOpen, onClose, children }: ModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDownWindow = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDownWindow)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDownWindow)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const panel = panelRef.current
    if (!panel) return

    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const focusables = getFocusableElements(panel)
    const first = focusables[0]
    window.setTimeout(() => {
      first?.focus()
    }, 0)

    const onKeyDownPanel = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const list = getFocusableElements(panel)
      if (list.length === 0) return
      const firstEl = list[0]
      const lastEl = list[list.length - 1]
      if (event.shiftKey) {
        if (document.activeElement === firstEl) {
          event.preventDefault()
          lastEl.focus()
        }
      } else if (document.activeElement === lastEl) {
        event.preventDefault()
        firstEl.focus()
      }
    }

    panel.addEventListener('keydown', onKeyDownPanel)
    return () => {
      panel.removeEventListener('keydown', onKeyDownPanel)
      const prev = previouslyFocusedRef.current
      if (prev?.isConnected) prev.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
      aria-hidden="true"
    >
      <div
        ref={panelRef}
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal-header">
          <h3 id={titleId}>{title}</h3>
          <button type="button" className="ghost-btn" onClick={onClose}>
            Fermer
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
