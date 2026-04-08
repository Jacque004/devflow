import { Link, Outlet } from 'react-router-dom'
import { publicUrl } from '../../lib/publicUrl'

export function LegalDocumentLayout() {
  return (
    <div className="legal-shell">
      <header className="legal-shell-header">
        <Link to="/" className="brand legal-brand">
          <img src={publicUrl('/logo.png')} alt="" className="brand-logo" width={32} height={32} />
          <span className="brand-text">DevFlow</span>
        </Link>
        <nav className="legal-shell-nav" aria-label="Acces rapide">
          <Link to="/cgu" className="inline-link">
            CGU
          </Link>
          <Link to="/politique-confidentialite" className="inline-link">
            Confidentialite
          </Link>
          <Link to="/login" className="inline-link">
            Connexion
          </Link>
          <Link to="/signup" className="inline-link">
            Inscription
          </Link>
        </nav>
      </header>
      <main className="legal-shell-main">
        <Outlet />
      </main>
    </div>
  )
}
