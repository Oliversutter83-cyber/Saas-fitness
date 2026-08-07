/**
 * Textes de la page de vente.
 *
 * ⚠️ TÉMOIGNAGES : le tableau est volontairement vide. N'y mettez que de vrais
 * retours de vrais abonnés, avec leur accord. Publier des témoignages inventés
 * est une pratique commerciale trompeuse (article L121-2 du Code de la
 * consommation) et c'est aussi un motif de refus de compte publicitaire chez
 * Meta et TikTok. La section se masque toute seule tant que le tableau est vide.
 */

export type Testimonial = {
  name: string;
  detail: string;
  quote: string;
};

export const TESTIMONIALS: Testimonial[] = [
  // Exemple de format à respecter une fois que vous aurez de vrais retours :
  // { name: "Sarah M.", detail: "Abonnée depuis 3 mois", quote: "…" },
];

export const PAIN_POINTS = [
  {
    icon: "⏳",
    title: "Pas le temps d'aller à la salle",
    text: "Entre le trajet, le vestiaire et l'attente des machines, une séance vous coûte deux heures. Ici, elle en coûte vingt-cinq minutes, chez vous.",
  },
  {
    icon: "🤷",
    title: "Vous ne savez pas quoi faire",
    text: "Les vidéos gratuites s'enchaînent sans logique. Vous suivez un programme construit, semaine après semaine, avec une progression prévue.",
  },
  {
    icon: "📉",
    title: "Vous abandonnez au bout de deux semaines",
    text: "Des séances courtes, un plan clair et vos séances cochées : c'est ce qui fait tenir. Pas la motivation du premier jour.",
  },
];

export const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Choisissez votre programme",
    text: "Perte de poids, remise en forme, fessiers, haut du corps. Quatre cycles de 4 semaines, du niveau débutant à confirmé.",
  },
  {
    step: "2",
    title: "Suivez la séance guidée",
    text: "Un exercice à la fois, avec son carrousel d'étapes et le minuteur qui tourne. Vous n'avez plus qu'à faire ce qui est affiché.",
  },
  {
    step: "3",
    title: "Cochez, progressez",
    text: "Chaque séance terminée est enregistrée. Vous voyez vos séries, votre régularité et votre progression noir sur blanc.",
  },
];

export const FEATURES = [
  {
    title: "Des mouvements expliqués en carrousel",
    text: "Chaque exercice est décomposé en étapes illustrées que vous faites défiler. Pas de vidéo à charger, ça marche même en 3G.",
  },
  {
    title: "Aucun matériel",
    text: "Une chaise, un mur, de quoi s'allonger. Rien à acheter, rien à stocker.",
  },
  {
    title: "20 à 30 minutes par séance",
    text: "Échauffement, circuit, étirements. Le format tient dans une pause déjeuner.",
  },
  {
    title: "Un minuteur qui vous guide",
    text: "Temps de travail, temps de repos, exercice suivant annoncé. Vous posez le téléphone et vous suivez.",
  },
  {
    title: "Erreurs à éviter pour chaque exercice",
    text: "Ce qui protège vos genoux et votre dos est écrit noir sur blanc, à côté du mouvement.",
  },
  {
    title: "Votre progression enregistrée",
    text: "Séances terminées, série en cours, poids : tout est suivi dans votre espace.",
  },
];

export const FAQ = [
  {
    q: "Je n'ai jamais fait de sport, c'est fait pour moi ?",
    a: "Oui. Le programme « Démarrage Full Body » suppose zéro base : les mouvements ont tous une version allégée indiquée (pompes sur les genoux, squat contre le mur…). Vous commencez à 2 tours de circuit et vous montez progressivement.",
  },
  {
    q: "Il me faut du matériel ?",
    a: "Non. Une chaise stable, un mur et de quoi vous allonger suffisent pour l'intégralité des programmes. Un tapis rend juste les exercices au sol plus confortables.",
  },
  {
    q: "Ça marche sur téléphone ?",
    a: "C'est même pensé pour ça. Le site s'utilise dans le navigateur du téléphone et peut s'ajouter à l'écran d'accueil comme une application, sans passer par un store.",
  },
  {
    q: "Pourquoi des carrousels illustrés plutôt que des vidéos ?",
    a: "Parce qu'on lit une étape à son rythme, sans revenir en arrière dix fois, et parce que ça se charge instantanément même avec une mauvaise connexion. Le bouton « Animer » enchaîne les étapes si vous préférez voir le geste en mouvement.",
  },
  {
    q: "Combien de temps avant de voir des résultats ?",
    a: "Cela dépend de votre point de départ, de votre régularité et de votre alimentation, et personne ne peut vous promettre un chiffre honnêtement. Ce que le programme garantit, c'est un plan cohérent sur 4 semaines et de quoi mesurer votre régularité.",
  },
  {
    q: "Comment j'arrête mon abonnement ?",
    a: "Depuis votre espace, rubrique Abonnement : un bouton ouvre le portail de gestion et vous résiliez en deux clics. L'accès reste actif jusqu'à la fin de la période déjà payée.",
  },
  {
    q: "Je peux m'entraîner en appartement sans déranger les voisins ?",
    a: "Oui. Les programmes « Démarrage Full Body » et « Fessiers & Jambes » ne contiennent quasiment aucun saut. Les séances HIIT en contiennent : chaque exercice sauté a une alternative au sol indiquée.",
  },
];
