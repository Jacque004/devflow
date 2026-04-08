import { Link } from 'react-router-dom'

export function PrivacyPage() {
  return (
    <article className="card legal-doc">
      <h1>Politique de confidentialite</h1>
      <p className="legal-doc-updated muted">Derniere mise a jour : avril 2026</p>

      <section className="legal-doc-section">
        <h2>1. Responsable du traitement</h2>
        <p>
          Le service <strong>DevFlow</strong> (ci-apres le « Service ») est exploite par son editeur (ci-apres
          « nous », « notre »). Pour toute question relative a cette politique ou a tes donnees personnelles, tu peux
          nous contacter via les coordonnees indiquees en fin de document (section 9).
        </p>
      </section>

      <section className="legal-doc-section">
        <h2>2. Donnees collectees</h2>
        <p>Nous traitons notamment les categories de donnees suivantes :</p>
        <ul>
          <li>
            <strong>Compte :</strong> adresse e-mail et donnees d&apos;authentification gerees par notre prestataire
            (mot de passe chiffre, jetons de session, etc.) ;
          </li>
          <li>
            <strong>Contenus du Service :</strong> donnees que tu saisis ou importes (projets, taches, snippets, entrees
            de journal, preferences d&apos;usage le cas echeant) ;
          </li>
          <li>
            <strong>Donnees techniques :</strong> journaux techniques limites (erreurs, securite) necessaires au bon
            fonctionnement et a la securite du Service.
          </li>
        </ul>
      </section>

      <section className="legal-doc-section">
        <h2>3. Finalites et bases legales</h2>
        <p>Nous utilisons tes donnees pour :</p>
        <ul>
          <li>fournir le Service, gerer ton compte et assurer la securite (execution du contrat, interet legitime) ;</li>
          <li>repondre a nos obligations legales (conservation limitee de certaines traces si la loi l&apos;exige) ;</li>
          <li>ameliorer la fiabilite du Service (mesures strictement necessaires, interet legitime).</li>
        </ul>
      </section>

      <section className="legal-doc-section">
        <h2>4. Hebergement et sous-traitants</h2>
        <p>
          Le Service s&apos;appuie sur des prestataires techniques (notamment pour l&apos;authentification, la base de
          donnees et l&apos;hebergement). Les donnees peuvent etre traitees dans l&apos;Union europeenne ou, le cas
          echeant, transferees vers des pays offrant un niveau de protection adequat au sens du RGPD, ou encadrees par
          des garanties appropriees (clauses contractuelles types, etc.).
        </p>
      </section>

      <section className="legal-doc-section">
        <h2>5. Duree de conservation</h2>
        <p>
          Les donnees du compte et les contenus sont conserves tant que ton compte est actif. Apres suppression du compte
          ou sur demande lorsque la loi l&apos;autorise, nous supprimons ou anonymisons les donnees dans des delais
          raisonnables, sous reserve des obligations legales de conservation.
        </p>
      </section>

      <section className="legal-doc-section">
        <h2>6. Tes droits</h2>
        <p>
          Dans les conditions prevues par le RGPD et la loi applicable, tu disposes notamment d&apos;un droit d&apos;acces,
          de rectification, d&apos;effacement, de limitation du traitement, d&apos;opposition et de portabilite lorsque
          cela s&apos;applique. Tu peux aussi introduire une reclamation aupres de l&apos;autorite de protection des
          donnees competente (en France : la CNIL).
        </p>
      </section>

      <section className="legal-doc-section">
        <h2>7. Securite</h2>
        <p>
          Nous mettons en oeuvre des mesures techniques et organisationnelles appropriees pour proteger tes donnees contre
          l&apos;acces non autorise, la perte ou l&apos;alteration. Aucun systeme n&apos;etant absolument infallible, nous
          t&apos;invitons a utiliser un mot de passe robuste et unique.
        </p>
      </section>

      <section className="legal-doc-section">
        <h2>8. Lien avec les CGU</h2>
        <p>
          L&apos;usage du Service est egalement regi par nos{' '}
          <Link to="/cgu" className="inline-link">
            conditions generales d&apos;utilisation
          </Link>
          .
        </p>
      </section>

      <section className="legal-doc-section">
        <h2>9. Contact</h2>
        <p>
          Pour exercer tes droits ou poser une question relative a cette politique, contacte-nous via le canal prevu par
          l&apos;exploitant du Service (a renseigner : adresse e-mail ou formulaire dedie).
        </p>
      </section>
    </article>
  )
}
