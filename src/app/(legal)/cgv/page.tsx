import type { Metadata } from "next";
import { LEGAL, PLANS, SITE, TRIAL_DAYS } from "@/config";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  robots: { index: true, follow: true },
};

export default function CgvPage() {
  return (
    <>
      <h1>Conditions générales de vente et d&apos;utilisation</h1>

      <h2>1. Objet</h2>
      <p>
        Les présentes conditions régissent la vente de l&apos;abonnement au service {SITE.name},
        édité par {LEGAL.companyName}, et l&apos;utilisation du site accessible à l&apos;adresse{" "}
        {SITE.url}. Toute souscription implique leur acceptation sans réserve.
      </p>

      <h2>2. Description du service</h2>
      <p>
        {SITE.name} donne accès, en ligne, à des programmes d&apos;entraînement physique à réaliser à
        domicile : séances structurées, descriptions d&apos;exercices illustrées, minuteur de séance
        et suivi de progression. Le service est fourni sous forme d&apos;accès à un site web ; aucun
        bien matériel n&apos;est livré et aucun accompagnement personnalisé par un coach n&apos;est
        inclus.
      </p>

      <h2>3. Compte</h2>
      <p>
        L&apos;accès nécessite la création d&apos;un compte avec une adresse email valide. Vous êtes
        responsable de la confidentialité de vos identifiants et de toute activité effectuée depuis
        votre compte. Le compte est strictement personnel.
      </p>

      <h2>4. Prix et formules</h2>
      <p>Les formules d&apos;abonnement proposées sont les suivantes, toutes taxes comprises :</p>
      <ul>
        {Object.values(PLANS).map((plan) => (
          <li key={plan.id}>
            {plan.name} : {plan.priceLabel} {plan.periodLabel}
          </li>
        ))}
      </ul>
      <p>
        Les prix sont indiqués en euros. L&apos;éditeur peut les modifier à tout moment ; le nouveau
        tarif s&apos;applique alors à compter de la période de facturation suivante, après
        information préalable de l&apos;abonné.
      </p>

      <h2>5. Période d&apos;essai</h2>
      <p>
        Toute première souscription ouvre une période d&apos;essai de {TRIAL_DAYS} jours. Aucun
        montant n&apos;est prélevé pendant cette période. Si l&apos;abonnement n&apos;est pas résilié
        avant son terme, il se poursuit automatiquement et le premier paiement est prélevé à la fin
        de l&apos;essai. La période d&apos;essai est limitée à une par personne.
      </p>

      <h2>6. Paiement</h2>
      <p>
        Le paiement est traité par Stripe Payments Europe Ltd. Aucune donnée bancaire n&apos;est
        collectée ni conservée par l&apos;éditeur. L&apos;abonnement est reconduit tacitement à
        chaque échéance jusqu&apos;à résiliation.
      </p>
      <p>
        En cas d&apos;échec de paiement, l&apos;accès peut être suspendu après information de
        l&apos;abonné et plusieurs tentatives de prélèvement.
      </p>

      <h2>7. Résiliation</h2>
      <p>
        L&apos;abonnement peut être résilié à tout moment depuis l&apos;espace personnel, rubrique
        « Abonnement », sans frais ni justification. La résiliation prend effet au terme de la
        période en cours : l&apos;accès reste ouvert jusqu&apos;à cette date, et aucun nouveau
        prélèvement n&apos;intervient ensuite. Les sommes correspondant à une période déjà entamée ne
        sont pas remboursées au prorata.
      </p>

      <h2>8. Droit de rétractation</h2>
      <p>
        Conformément aux articles L221-18 et suivants du Code de la consommation, vous disposez
        d&apos;un délai de quatorze jours à compter de la souscription pour exercer votre droit de
        rétractation, par simple demande adressée à{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
      <p>
        En application de l&apos;article L221-28 13°, ce droit ne peut plus être exercé si vous avez
        expressément demandé l&apos;accès immédiat au contenu numérique, reconnu que cela entraîne la
        perte de votre droit de rétractation, et que la fourniture du service a commencé. La période
        d&apos;essai de {TRIAL_DAYS} jours vous permet, en pratique, d&apos;évaluer le service sans
        engagement financier.
      </p>

      <h2>9. Obligations de l&apos;utilisateur</h2>
      <ul>
        <li>Fournir des informations exactes lors de l&apos;inscription</li>
        <li>Ne pas partager ses identifiants ni revendre l&apos;accès</li>
        <li>Ne pas copier, extraire ou rediffuser les contenus du service</li>
        <li>
          Adapter l&apos;intensité des séances à sa condition physique et respecter les
          avertissements santé
        </li>
      </ul>

      <h2>10. Santé et responsabilité</h2>
      <p>
        Le service ne fournit ni diagnostic ni prescription médicale. Vous déclarez être apte à
        pratiquer une activité physique et avoir, si nécessaire, consulté un professionnel de santé
        au préalable. L&apos;éditeur ne peut être tenu responsable des blessures ou dommages
        résultant d&apos;une pratique inadaptée, d&apos;un non-respect des consignes techniques ou
        d&apos;un environnement d&apos;entraînement dangereux.
      </p>

      <h2>11. Disponibilité</h2>
      <p>
        L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;accès au service en continu, sans
        garantie de disponibilité permanente. Une interruption ponctuelle pour maintenance ou en cas
        de force majeure n&apos;ouvre pas droit à indemnisation.
      </p>

      <h2>12. Données personnelles</h2>
      <p>
        Le traitement des données est décrit dans la <a href="/confidentialite">politique de
        confidentialité</a>.
      </p>

      <h2>13. Droit applicable</h2>
      <p>
        Les présentes conditions sont soumises au droit français. En cas de litige, une solution
        amiable sera recherchée en priorité, y compris par la voie de la médiation de la
        consommation, avant toute action judiciaire.
      </p>
    </>
  );
}
