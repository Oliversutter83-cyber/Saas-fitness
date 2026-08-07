import type { Metadata } from "next";
import { LEGAL, SITE } from "@/config";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <h1>Mentions légales</h1>

      <h2>Éditeur du site</h2>
      <p>
        {LEGAL.companyName} — {LEGAL.legalForm}
        <br />
        Siège social : {LEGAL.address}
        <br />
        SIRET : {LEGAL.siret}
        <br />
        Numéro de TVA intracommunautaire : {LEGAL.vatNumber}
        <br />
        Directeur de la publication : {LEGAL.publisher}
        <br />
        Contact : <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </p>

      <h2>Hébergement</h2>
      <p>{LEGAL.host}</p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus présents sur {SITE.name} (programmes, descriptions
        d&apos;exercices, illustrations, textes, éléments graphiques et code) est protégé par le
        droit d&apos;auteur et reste la propriété exclusive de l&apos;éditeur. Toute reproduction,
        représentation ou diffusion, totale ou partielle, sans autorisation écrite préalable est
        interdite.
      </p>
      <p>
        L&apos;abonnement confère un droit d&apos;usage personnel et non transférable. Le partage
        d&apos;identifiants ou la rediffusion des programmes à des tiers ne sont pas autorisés.
      </p>

      <h2>Avertissement santé</h2>
      <p>
        Les contenus proposés sur {SITE.name} sont fournis à titre informatif et ne constituent en
        aucun cas un avis, un diagnostic ou une prescription médicale. Ils ne remplacent pas la
        consultation d&apos;un professionnel de santé.
      </p>
      <p>
        Avant de commencer ou de reprendre une activité physique, demandez l&apos;avis de votre
        médecin, en particulier en cas d&apos;antécédent cardiaque, de blessure, d&apos;hypertension,
        de grossesse, de surpoids important ou de traitement médical en cours. Interrompez
        immédiatement l&apos;exercice en cas de douleur, de vertige, d&apos;essoufflement anormal ou
        de gêne, et consultez un professionnel de santé.
      </p>
      <p>
        Vous restez seul responsable de l&apos;exécution des mouvements, de l&apos;adaptation de
        l&apos;intensité à votre condition physique et de la sécurité de votre espace
        d&apos;entraînement. L&apos;éditeur ne saurait être tenu responsable des dommages résultant
        d&apos;une utilisation inadaptée des programmes.
      </p>

      <h2>Responsabilité</h2>
      <p>
        L&apos;éditeur met tout en œuvre pour assurer l&apos;exactitude des informations diffusées et
        la disponibilité du service, sans pouvoir garantir une absence totale d&apos;interruption ou
        d&apos;erreur. Le service peut être momentanément suspendu pour maintenance.
      </p>

      <h2>Médiation de la consommation</h2>
      <p>
        Conformément à l&apos;article L612-1 du Code de la consommation, tout consommateur a le droit
        de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable
        d&apos;un litige. Les coordonnées du médiateur retenu par l&apos;éditeur sont communiquées
        sur demande à <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. La plateforme européenne de
        règlement en ligne des litiges est accessible à l&apos;adresse{" "}
        <a href="https://ec.europa.eu/consumers/odr">ec.europa.eu/consumers/odr</a>.
      </p>
    </>
  );
}
