# Fit Maison — SaaS de fitness à la maison

Un site d'abonnement (pas une application mobile) qui vend des programmes
d'entraînement à faire chez soi, sans matériel. Les mouvements ne sont pas
filmés : ils sont **dessinés et animés**, ce qui supprime toute production
vidéo et rend le site instantané même en mauvaise connexion.

Pensé pour recevoir du trafic payant Instagram et TikTok : page de vente,
séance d'essai sans inscription, paiement Stripe, et un générateur de
carrousels publicitaires intégré.

---

## Démarrer en local

```bash
npm install
cp .env.example .env          # puis remplir AUTH_SECRET (voir ci-dessous)
npx prisma migrate dev        # crée la base SQLite
npm run dev                   # http://localhost:3000
```

La seule variable **obligatoire** est `AUTH_SECRET` :

```bash
openssl rand -base64 32
```

Sans clés Stripe, le site tourne en **mode démo** : le bouton « Démarrer
l'essai » ouvre l'accès sans encaisser de paiement, ce qui permet de tester
tout le produit de bout en bout.

---

## Ce que contient le site

| Page | Rôle |
|---|---|
| `/` | Page de vente : promesse, méthode, programmes, tarifs, FAQ |
| `/seance-decouverte` | Séance complète gratuite, **sans créer de compte** — la page à mettre en lien de bio |
| `/exercices` et `/exercices/[slug]` | Bibliothèque publique des 31 exercices (elle capte du trafic gratuit sur Google) |
| `/inscription`, `/connexion` | Création de compte et connexion |
| `/app` | Tableau de bord : prochaine séance, régularité, avancement |
| `/app/programmes/[slug]` | Les 4 semaines d'un programme, séance par séance |
| `/seance/[programme]/[semaine]/[jour]` | Le lecteur de séance guidé : minuteur, animation, consignes |
| `/app/progression` | Séances terminées, courbe de poids, mesures |
| `/app/abonnement` | Formules, activation, résiliation |
| `/app/kit-pub` | **Votre outil** : fabrique les carrousels Instagram/TikTok en PNG |
| `/cgv`, `/mentions-legales`, `/confidentialite` | Obligatoire pour ouvrir Stripe et faire de la pub |

---

## Comment fonctionnent les animations d'exercices

Il n'y a **aucun média** dans le projet : pas de vidéo, pas de photo, pas de GIF.

1. `src/content/poses.ts` décrit chaque posture par les coordonnées de ses
   articulations (tête, nuque, bassin, coudes, mains, genoux, pieds) dans un
   repère de 200×200.
2. `src/components/Figure.tsx` transforme une posture en dessin SVG.
3. `src/components/AnimatedFigure.tsx` **interpole** les articulations entre
   deux postures : le bonhomme descend et remonte réellement, en aller-retour,
   comme une répétition.
4. `src/components/ExerciseCarousel.tsx` propose les deux lectures : le
   mouvement animé, ou les étapes une par une à faire défiler au doigt.

Conséquences pratiques : le site pèse quelques kilo-octets par exercice,
s'affiche instantanément en 3G, et **ajouter un exercice ne demande aucun
tournage** — juste quelques coordonnées et un texte.

### Ajouter un exercice

1. Ajoutez les postures manquantes dans `src/content/poses.ts`.
2. Ajoutez l'exercice dans `src/content/exercises.ts` (étapes, conseils,
   erreurs à éviter, respiration, versions plus facile / plus dure).
3. Il apparaît automatiquement dans la bibliothèque, le plan du site et le
   générateur de carrousels.

### Ajouter ou modifier un programme

Tout est dans `src/content/programs.ts`. Les séances ne sont pas écrites une
par une : on décrit un modèle de séance par jour, et la progression sur les 4
semaines (plus de tours, plus de répétitions, moins de repos) est appliquée
automatiquement. Un contrôle au démarrage vérifie que chaque exercice
référencé existe réellement.

---

## Mettre Stripe en service

1. Créez un compte sur [stripe.com](https://stripe.com).
2. **Produits** → créez un produit « Abonnement » avec deux tarifs récurrents
   (9,99 €/mois et 79 €/an). Copiez les deux identifiants `price_…`.
3. **Développeurs → Clés API** → copiez la clé secrète.
4. **Développeurs → Webhooks** → ajoutez `https://votre-domaine.fr/api/stripe/webhook`
   avec les événements : `checkout.session.completed`,
   `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.payment_failed`. Copiez le secret
   de signature.
5. Renseignez `STRIPE_SECRET_KEY`, `STRIPE_PRICE_MENSUEL`, `STRIPE_PRICE_ANNUEL`
   et `STRIPE_WEBHOOK_SECRET` dans `.env`.

C'est le **webhook** qui fait autorité sur l'état de l'abonnement, pas la page
de retour après paiement : un client qui ferme son onglet trop tôt est quand
même activé correctement.

---

## Mise en production

1. **Base de données.** SQLite convient pour développer, pas pour la
   production. Prenez une base PostgreSQL (Neon, Supabase, Prisma Postgres),
   puis :
   ```bash
   npm i @prisma/adapter-pg pg
   ```
   passez `provider = "postgresql"` dans `prisma/schema.prisma`, remplacez
   l'adaptateur dans `src/lib/db.ts`, et lancez `npx prisma migrate deploy`.
2. **Hébergement.** Vercel convient bien à Next.js. Renseignez-y les mêmes
   variables d'environnement, avec `NEXT_PUBLIC_SITE_URL` sur votre vrai
   domaine.
3. **Avant d'ouvrir au public :**
   - complétez `LEGAL` dans `src/config.ts` (raison sociale, adresse, SIRET) —
     ces informations sont obligatoires et Stripe les demandera ;
   - renseignez `OWNER_EMAIL` pour que `/app/kit-pub` ne soit visible que par
     vous ;
   - remplacez le nom, les tarifs et les liens de réseaux sociaux dans
     `src/config.ts`.

---

## Publicité Instagram et TikTok

L'outil `/app/kit-pub` fabrique les visuels à partir des exercices du site :
vous choisissez le format (carré, portrait, vertical), l'accroche et les
exercices, et vous téléchargez les slides en PNG avec une légende prête à
coller.

Deux points qui changent tout sur le rendement des pubs :

- **Envoyez le trafic vers `/seance-decouverte`, pas vers la page d'accueil.**
  Le visiteur essaie une vraie séance avant qu'on lui demande quoi que ce soit,
  et l'inscription lui est proposée une fois la séance terminée.
- **Ne publiez jamais de faux témoignages.** Le tableau `TESTIMONIALS` dans
  `src/content/marketing.ts` est volontairement vide et la section se masque
  toute seule : n'y mettez que de vrais retours d'abonnés, avec leur accord.
  Les témoignages inventés sont une pratique commerciale trompeuse et un motif
  classique de fermeture de compte publicitaire chez Meta et TikTok.

---

## Pile technique

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Prisma 7 · Stripe · SQLite en local, PostgreSQL en production.

Aucune librairie de graphiques, de carrousel ou d'animation : tout est en SVG
et CSS natifs, ce qui garde le site léger et sans dépendance à maintenir.

## Commandes

```bash
npm run dev     # développement
npm run build   # build de production
npm run start   # serveur de production
npm run lint    # ESLint
npx prisma studio   # explorer la base de données
```
