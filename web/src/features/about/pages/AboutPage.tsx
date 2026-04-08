export function AboutPage() {
  return (
    <section>
      <div className="page-header">
        <div>
          <h1>A propos de DevFlow</h1>
          <p className="muted">Pourquoi cette application existe et comment t&apos;aider au quotidien.</p>
        </div>
      </div>

      <article className="card">
        <h2>Le but du projet</h2>
        <p>
          DevFlow est un espace personnel pour <strong>organiser ton travail de developpement</strong> : regrouper
          tes projets, suivre les taches sur un tableau Kanban, conserver des extraits de code reutilisables et
          tenir un journal d&apos;activite. L&apos;objectif est de reduire le va-et-vient entre outils disparates et
          d&apos;avoir une vue claire sur ce qui avance.
        </p>
      </article>

      <article className="card">
        <h2>A quoi ca sert ?</h2>
        <ul className="about-list">
          <li>
            <strong>Dashboard</strong> — Vue d&apos;ensemble : nombre de projets, taches en cours ou terminees,
            apercu de l&apos;activite recente.
          </li>
          <li>
            <strong>Projets</strong> — Creer des espaces par sujet ou client ; chaque projet ouvre un Kanban pour
            piloter les taches (a faire, en cours, termine).
          </li>
          <li>
            <strong>Snippets</strong> — Stocker morceaux de code, langage et tags pour les retrouver vite.
          </li>
          <li>
            <strong>Journal</strong> — Noter ce que tu as fait, utile pour les bilans ou la memoire du contexte.
          </li>
        </ul>
      </article>

      <article className="card">
        <h2>Technique</h2>
        <p className="muted">
          Interface web (React), donnees synchronisees via Supabase (compte securise, acces limite a tes donnees).
          Pense pour un usage personnel ou en petite equipe selon ta configuration.
        </p>
      </article>
    </section>
  )
}
