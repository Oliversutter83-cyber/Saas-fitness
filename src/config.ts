/**
 * Tout ce qui est propre à VOTRE marque et à VOTRE offre est regroupé ici.
 * Changer le nom, les prix ou les coordonnées se fait dans ce seul fichier.
 */

export const SITE = {
  name: "ATLAS",
  /** Utilisé dans les titres de page et les partages */
  tagline: "La méthode pour s'entraîner chez soi",
  description:
    "Des programmes d'entraînement à la maison, sans matériel et sans vidéo à regarder : chaque mouvement est animé et décomposé étape par étape. 20 à 30 minutes par séance.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "contact@atlas-training.fr",

  /**
   * Réseaux sociaux. Vérifiez que le pseudo est libre AVANT de le figer ici :
   * instagram.com/<pseudo> et tiktok.com/@<pseudo> doivent afficher une page
   * introuvable. Prenez le même pseudo sur les deux plateformes.
   * Ce pseudo alimente aussi les visuels générés dans /app/kit-pub.
   */
  handle: "@atlas.training.fr",
  instagram: "https://instagram.com/atlas.training.fr",
  tiktok: "https://tiktok.com/@atlas.training.fr",
};

/**
 * Informations légales — À COMPLÉTER avant la mise en ligne.
 * Elles alimentent les mentions légales et les CGV, obligatoires pour
 * ouvrir un compte Stripe et pour faire de la publicité.
 */
export const LEGAL = {
  companyName: "[Votre raison sociale]",
  legalForm: "[Forme juridique — ex. micro-entreprise]",
  address: "[Adresse complète]",
  siret: "[Numéro SIRET]",
  vatNumber: "[Numéro de TVA, si applicable]",
  publisher: "[Nom du directeur de la publication]",
  host: "Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA",
  updatedAt: "2026",
};

export type PlanId = "mensuel" | "annuel";

export const PLANS: Record<
  PlanId,
  {
    id: PlanId;
    name: string;
    priceLabel: string;
    periodLabel: string;
    /** Prix en centimes, sert au mode démo et à l'affichage */
    amountCents: number;
    /** Renseigné dans .env une fois les tarifs créés dans Stripe */
    envKey: string;
    perks: string[];
    highlight?: string;
  }
> = {
  mensuel: {
    id: "mensuel",
    name: "Mensuel",
    priceLabel: "9,99 €",
    periodLabel: "par mois",
    amountCents: 999,
    envKey: "STRIPE_PRICE_MENSUEL",
    perks: ["Sans engagement", "Résiliable en 2 clics"],
  },
  annuel: {
    id: "annuel",
    name: "Annuel",
    priceLabel: "79 €",
    periodLabel: "par an",
    amountCents: 7900,
    envKey: "STRIPE_PRICE_ANNUEL",
    highlight: "2 mois offerts",
    perks: ["Soit 6,58 € par mois", "Le meilleur tarif"],
  },
};

export const TRIAL_DAYS = 3;

export function planFromPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_ANNUEL) return "annuel";
  if (priceId === process.env.STRIPE_PRICE_MENSUEL) return "mensuel";
  return null;
}
