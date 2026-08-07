import type { Metadata } from "next";
import { LEGAL, SITE } from "@/config";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  robots: { index: true, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p>
        {LEGAL.companyName}, responsable du traitement, s&apos;engage à protéger les données
        personnelles des utilisateurs de {SITE.name}, conformément au Règlement général sur la
        protection des données (RGPD) et à la loi Informatique et Libertés.
      </p>

      <h2>Données collectées</h2>
      <ul>
        <li>
          <strong>Compte :</strong> prénom, adresse email, mot de passe (stocké sous forme chiffrée
          et jamais en clair), objectif et niveau déclarés.
        </li>
        <li>
          <strong>Entraînement :</strong> séances terminées, durée, ressenti déclaré, et, si vous
          les saisissez, poids, tour de taille et notes personnelles.
        </li>
        <li>
          <strong>Abonnement :</strong> identifiant client et identifiant d&apos;abonnement Stripe,
          statut et date d&apos;échéance. Aucune donnée de carte bancaire n&apos;est reçue ni
          conservée par l&apos;éditeur.
        </li>
        <li>
          <strong>Prospection :</strong> adresse email, si vous la communiquez volontairement depuis
          la page d&apos;accueil.
        </li>
      </ul>

      <h2>Finalités et bases légales</h2>
      <ul>
        <li>
          Fournir le service et votre suivi de progression — exécution du contrat.
        </li>
        <li>Gérer l&apos;abonnement et la facturation — exécution du contrat et obligation légale.</li>
        <li>
          Vous envoyer des informations sur le service si vous avez laissé votre email — consentement,
          révocable à tout moment.
        </li>
        <li>Assurer la sécurité du service et prévenir les abus — intérêt légitime.</li>
      </ul>

      <h2>Données de santé</h2>
      <p>
        Le poids et le tour de taille que vous saisissez sont facultatifs. Ils ne servent qu&apos;à
        afficher votre propre suivi, ne sont jamais transmis à des tiers et ne font l&apos;objet
        d&apos;aucune analyse automatisée. Vous pouvez ne rien saisir sans perdre l&apos;accès au
        service.
      </p>

      <h2>Destinataires</h2>
      <p>
        Vos données ne sont ni vendues ni louées. Elles sont accessibles à l&apos;éditeur et à ses
        sous-traitants techniques, tenus par contrat à la même exigence de confidentialité :
      </p>
      <ul>
        <li>Stripe Payments Europe Ltd — traitement des paiements et gestion des abonnements</li>
        <li>{LEGAL.host} — hébergement du site et de la base de données</li>
      </ul>

      <h2>Durée de conservation</h2>
      <ul>
        <li>Données de compte et d&apos;entraînement : pendant toute la durée du compte, puis 12 mois.</li>
        <li>Données de facturation : 10 ans, conformément aux obligations comptables.</li>
        <li>Emails de prospection : 3 ans à compter du dernier contact.</li>
      </ul>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de
        limitation, d&apos;opposition et de portabilité de vos données, ainsi que du droit de
        définir des directives relatives à leur sort après votre décès. Pour les exercer, écrivez à{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Une réponse vous sera apportée dans un
        délai d&apos;un mois.
      </p>
      <p>
        Vous pouvez également introduire une réclamation auprès de la CNIL —{" "}
        <a href="https://www.cnil.fr">www.cnil.fr</a>.
      </p>

      <h2>Cookies</h2>
      <p>
        {SITE.name} n&apos;utilise ni cookie publicitaire ni traceur de mesure d&apos;audience. Seul
        un cookie strictement nécessaire est déposé : il conserve votre session de connexion, expire
        au bout de 30 jours et ne nécessite pas de consentement préalable. Stripe peut déposer ses
        propres cookies techniques lors du passage sur sa page de paiement sécurisée.
      </p>
      <p>
        Si vous ajoutez ultérieurement des outils de mesure d&apos;audience ou des pixels
        publicitaires (Meta, TikTok), un bandeau de consentement conforme devra être mis en place et
        cette page mise à jour en conséquence.
      </p>

      <h2>Sécurité</h2>
      <p>
        Les mots de passe sont stockés hachés avec bcrypt. Les échanges avec le site sont chiffrés en
        HTTPS. Les sessions reposent sur un cookie signé, inaccessible au JavaScript de la page.
      </p>
    </>
  );
}
