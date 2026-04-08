import { Link } from 'react-router-dom'

export function TermsPage() {
  return (
    <article className="card legal-doc">
      <h1>Conditions generales d&apos;utilisation (CGU)</h1>
      <p className="legal-doc-updated muted">Derniere mise a jour : avril 2026</p>

      <section className="legal-doc-section">
        <h2>1. Objet</h2>
        <p>
          Les presentes CGU regissent l&apos;acces et l&apos;utilisation du service en ligne <strong>DevFlow</strong>
          (ci-apres le « Service »), destine a l&apos;organisation personnelle ou professionnelle de projets de
          developpement (tableaux de taches, snippets, journal, etc.).
        </p>
      </section>

      <section className="legal-doc-section">
        <h2>2. Acceptation</h2>
        <p>
          En creant un compte ou en utilisant le Service, tu acceptes sans reserve les presentes CGU et la{' '}
          <Link to="/politique-confidentialite" className="inline-link">
            politique de confidentialite
          </Link>
          . Si tu n&apos;acceptes pas ces conditions, tu ne dois pas utiliser le Service.
        </p>
      </section>

      <section className="legal-doc-section">
        <h2>3. Compte et acces</h2>
        <p>
          Tu es responsable de l&apos;exactitude des informations fournies et de la confidentialite de tes identifiants
          (notamment mot de passe). Toute activite realisee depuis ton compte est presumee etre la tienne. Tu dois
          notifier sans delai toute utilisation non autorisee.
        </p>
      </section>

      <section className="legal-doc-section">
        <h2>4. Usage du Service</h2>
        <p>Tu t&apos;engages a utiliser le Service de maniere licite et notamment a ne pas :</p>
        <ul>
          <li>contourner les mesures de securite ou les limitations techniques ;</li>
          <li>introduire des contenus illicites, malveillants ou portant atteinte aux droits de tiers ;</li>
          <li>surcharger de maniere abusive les infrastructures ou nuire au bon fonctionnement du Service ;</li>
          <li>utiliser le Service pour des activites de spamming ou d&apos;ingenierie sociale non autorisees.</li>
        </ul>
      </section>

      <section className="legal-doc-section">
        <h2>5. Contenus utilisateur</h2>
        <p>
          Tu conserves la propriete intellectuelle sur les contenus que tu importes ou saisis. Tu garantis disposer
          des droits necessaires et accorde au Service les autorisations techniques strictement necessaires a
          l&apos;hebergement, l&apos;affichage et la sauvegarde de ces contenus aux fins de fourniture du Service.
        </p>
      </section>

      <section className="legal-doc-section">
        <h2>6. Disponibilite et evolution</h2>
        <p>
          Le Service est fourni « en l&apos;etat ». L&apos;exploitant peut en suspendre ou en modifier l&apos;acces
          (maintenance, evolution, force majeure) sans garantie de disponibilite continue. Des limitations ou une
          interruption peuvent survenir sans que la responsabilite de l&apos;exploitant ne soit engagee au-dela de ce que
          la loi impose.
        </p>
      </section>

      <section className="legal-doc-section">
        <h2>7. Responsabilite</h2>
        <p>
          Dans les limites autorisees par la loi, l&apos;exploitant ne saurait etre tenu responsable des dommages
          indirects, perte de donnees non imputable a une faute lourde, ou prejudice resultant de l&apos;usage que tu
          fais du Service ou de tiers (prestataires d&apos;hebergement, reseau, etc.).
        </p>
      </section>

      <section className="legal-doc-section">
        <h2>8. Resiliation</h2>
        <p>
          Tu peux cesser d&apos;utiliser le Service a tout moment. L&apos;exploitant peut suspendre ou cloturer un
          compte en cas de violation des presentes CGU ou pour des motifs legitimes (securite, conformite legale), avec
          information lorsque la loi l&apos;exige.
        </p>
      </section>

      <section className="legal-doc-section">
        <h2>9. Droit applicable et litiges</h2>
        <p>
          Sous reserve des dispositions imperatives, les presentes CGU sont soumises au droit applicable choisi par
          l&apos;exploitant de l&apos;instance (a preciser). Les tribunaux competents seront ceux prevus par la loi ou,
          a defaut, ceux du lieu du siege de l&apos;exploitant.
        </p>
      </section>

      <section className="legal-doc-section">
        <h2>10. Contact</h2>
        <p>
          Pour toute question relative aux CGU, utilise le meme canal de contact que pour la politique de confidentialite
          (voir la page dediee).
        </p>
      </section>
    </article>
  )
}
