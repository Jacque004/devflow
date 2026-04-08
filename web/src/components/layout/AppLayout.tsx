import { Link, NavLink, Outlet } from 'react-router-dom'
import { Keyboard } from 'lucide-react'
import { env, parseSupabaseProjectRef } from '../../lib/env'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import { useEffect, useState } from 'react'
import { useUiStore } from '../../stores/useUiStore'
import { KeyboardShortcutsModal } from '../shared/KeyboardShortcutsModal'
import { SkipLink } from './SkipLink'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projets' },
  { to: '/snippets', label: 'Snippets' },
  { to: '/journal', label: 'Journal' },
  { to: '/profil', label: 'Profil' },
  { to: '/a-propos', label: 'A propos' },
]

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  )
}

export function AppLayout() {
  const { pushToast } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return

      if (event.key === '/') {
        event.preventDefault()
        const search = document.querySelector('[data-global-search="true"]') as HTMLInputElement | null
        search?.focus()
        return
      }

      if (event.key === '?') {
        event.preventDefault()
        setShortcutsOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      pushToast("Erreur pendant la deconnexion", 'error')
      return
    }
    pushToast('Deconnexion reussie', 'success')
  }

  return (
    <>
      <SkipLink />
      <div className="grid min-h-[100dvh] grid-cols-[minmax(0,268px)_1fr] max-[900px]:grid-cols-1">
      <aside
        className="sidebar"
        aria-label="Navigation principale DevFlow"
        data-supabase-project={parseSupabaseProjectRef(env.supabaseUrl) ?? ''}
      >
        <div className="sidebar-glow" aria-hidden="true" />
        <div className="relative z-[1] px-4 pb-6 pt-5">
          <div className="block max-[900px]:flex max-[900px]:items-center max-[900px]:justify-between">
            <Link to="/dashboard" className="brand mb-[1.35rem] max-[900px]:mb-0">
              <img src="/logo.png" alt="DevFlow logo" className="brand-logo" />
              <span className="brand-text">DevFlow</span>
            </Link>
            <button
              type="button"
              className="menu-toggle ghost-btn hidden max-[900px]:inline-flex max-[900px]:px-[0.65rem] max-[900px]:py-[0.45rem]"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-controls="navigation-principale"
              aria-label="Ouvrir ou fermer le menu"
            >
              Menu
            </button>
          </div>
          <p className="nav-section-label" id="navigation-section-title">
            Navigation
          </p>
          <nav
            className={`flex flex-col gap-[0.35rem] max-[900px]:mt-2 ${menuOpen ? 'max-[900px]:flex' : 'max-[900px]:hidden'}`}
            aria-labelledby="navigation-section-title"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <main className="relative mx-auto w-full max-w-[1180px] p-0">
        <div
          className="content-bg fixed inset-0 left-[268px] z-0 max-[900px]:left-0 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-[1] min-h-[100dvh] px-7 pb-10 pt-6 max-[900px]:px-4 max-[900px]:pb-8 max-[900px]:pt-[1.1rem]">
          <header className="mb-7 flex flex-wrap items-center justify-between gap-4 max-[900px]:mb-3 max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-3">
            <div className="flex items-center">
              <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--muted)] backdrop-blur-[10px]">
                Espace personnel
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn-ghost-pill inline-flex items-center gap-1.5"
                onClick={() => setShortcutsOpen(true)}
                aria-haspopup="dialog"
              >
                <Keyboard className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                Raccourcis
              </button>
              <button
                type="button"
                className="btn-ghost-pill"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-pressed={theme === 'dark'}
              >
                {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              </button>
              <button type="button" className="btn-ghost-pill" onClick={logout}>
                Deconnexion
              </button>
            </div>
          </header>
          <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
          <div id="contenu-principal" tabIndex={-1} className="contenu-principal outline-none">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
