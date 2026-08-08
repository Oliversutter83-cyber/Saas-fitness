"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { EcranExercice, Telephone } from "@/components/CarouselMockup";
import { FigureBody } from "@/components/Figure";
import { TRIAL_DAYS } from "@/config";
import { CATEGORIES, keyPoseOf, type Category, type Exercise } from "@/content/exercises";

/**
 * Fabrique de carrousels pour Instagram et TikTok.
 *
 * Les visuels sont dessinés en SVG puis rastérisés dans un canvas pour être
 * téléchargés en PNG. Tout se passe dans le navigateur : aucun service externe,
 * aucun quota, et les slides reprennent exactement les figures du produit — ce
 * que la pub montre est ce que l'abonné trouve derrière.
 */

const FORMATS = {
  carre: { label: "Carré · Instagram", w: 1080, h: 1080 },
  portrait: { label: "Portrait · Instagram", w: 1080, h: 1350 },
  vertical: { label: "Vertical · TikTok & Stories", w: 1080, h: 1920 },
} as const;

type FormatId = keyof typeof FORMATS;

/**
 * Les couleurs du site, reprises telles quelles.
 *
 * Une publicité verte pour un site noir et or trahit le clic : la personne
 * arrive sur une page qui ne ressemble pas à ce qu'elle vient de voir, et se
 * demande si elle s'est trompée d'endroit. Ces valeurs sont celles de
 * globals.css — elles doivent le rester.
 */
const THEMES = {
  sombre: {
    bg: "#0a0908",
    text: "#ffffff",
    muted: "#8a8078",
    accent: "#ddb13c",
    action: "#cf2f2f",
    card: "#131110",
  },
  or: {
    bg: "#ddb13c",
    text: "#0a0908",
    muted: "#5d4415",
    accent: "#0a0908",
    action: "#cf2f2f",
    card: "#eacb71",
  },
  clair: {
    bg: "#fdf9ef",
    text: "#0a0908",
    muted: "#7d5b16",
    accent: "#a37718",
    action: "#cf2f2f",
    card: "#ffffff",
  },
} as const;

type ThemeId = keyof typeof THEMES;

const VISUELS = {
  silhouette: "Silhouette seule",
  telephone: "Dans un téléphone",
} as const;

type VisuelId = keyof typeof VISUELS;

/**
 * Prompts d'images de fond, à coller dans un générateur d'images.
 *
 * Trois contraintes reviennent dans chacun, et ce sont elles qui font la
 * différence entre un joli fond et un fond utilisable : la scène doit être
 * sombre et peu chargée en haut, où passe le titre ; son centre doit rester
 * vide, où se pose le téléphone ; et elle ne doit contenir ni texte, ni
 * personne, ni marque — un texte généré est toujours illisible, et un visage
 * inventé pose des questions de droit à l'image dès qu'on fait de la publicité.
 */
const PROMPTS_FOND = [
  {
    label: "Salon au petit matin",
    texte:
      "Photographie réaliste d'un salon moderne vide au petit matin, parquet clair, grande fenêtre à gauche, lumière rasante chaude, tapis de sport déroulé au sol, ambiance très sombre et contrastée, dominante noire et dorée, partie haute de l'image presque noire et sans détail, centre dégagé, aucune personne, aucun texte, aucun logo, format vertical 9:16, rendu cinématographique.",
  },
  {
    label: "Appartement parisien",
    texte:
      "Photographie réaliste d'un appartement haussmannien vide, parquet à chevrons, moulures, fin de journée, lumière dorée rasante qui traverse la pièce, ambiance sombre et feutrée, dominante noire et or, haut de l'image dans l'ombre, centre dégagé, aucune personne, aucun texte, format vertical 9:16.",
  },
  {
    label: "Studio béton",
    texte:
      "Photographie réaliste d'un studio d'entraînement en béton brut, mur sombre texturé, un seul projecteur chaud rasant depuis la droite, poussière en suspension dans le faisceau, ambiance très sombre, dominante noire et dorée, haut de l'image quasi noir, centre vide, aucune personne, aucun texte, format vertical 9:16.",
  },
  {
    label: "Chambre minimaliste",
    texte:
      "Photographie réaliste d'une chambre minimaliste vide, mur uni sombre, tapis de yoga posé au sol, lumière douce dorée venant d'une lampe basse, beaucoup d'ombre, dominante noire et or, haut de l'image sans détail, centre dégagé, aucune personne, aucun texte, format vertical 9:16.",
  },
  {
    label: "Parc à l'aube",
    texte:
      "Photographie réaliste d'un sentier de parc désert à l'aube, brume légère, silhouettes d'arbres sombres, soleil bas qui perce entre les branches, ambiance sombre et dorée, haut de l'image assombri par le feuillage, centre dégagé, aucune personne, aucun texte, format vertical 9:16, rendu cinématographique.",
  },
  {
    label: "Terrasse au coucher du soleil",
    texte:
      "Photographie réaliste d'une terrasse en bois vide au coucher du soleil, ville floue au loin, ciel orangé assombri, ambiance contrastée, dominante noire et dorée, partie haute de l'image sombre, centre dégagé, aucune personne, aucun texte, format vertical 9:16.",
  },
  {
    label: "Texture abstraite",
    texte:
      "Fond abstrait sombre, texture de béton noir avec un halo doré diffus au centre-bas, grain fin, dégradé du noir profond vers l'or sourd, aucun objet reconnaissable, aucune personne, aucun texte, format vertical 9:16, rendu photographique haute définition.",
  },
  {
    label: "Fumée et lumière",
    texte:
      "Fond noir profond traversé par une fumée dorée très diffuse venant du bas, éclairage latéral chaud, contraste élevé, ambiance dramatique et épurée, aucun objet, aucune personne, aucun texte, format vertical 9:16, rendu photographique.",
  },
] as const;

/** Côté le plus long d'une photo de fond importée, en pixels. */
const FOND_MAX = 1400;

type Slide =
  | { kind: "hook"; kicker: string; question: string; reponse: string; exemple?: Exercise }
  | { kind: "exercise"; index: number; total: number; exercise: Exercise; caption: string }
  | { kind: "cta"; title: string; subtitle: string };

/**
 * Accroches prêtes à publier.
 *
 * La première slide décide seule si quelqu'un fait glisser ou passe son chemin.
 * Le schéma qui fonctionne est toujours le même : on nomme l'obstacle que la
 * personne a en tête, puis on le lève en une phrase.
 *
 * Aucune ne promet de résultat — ni kilos perdus, ni délai. Ce sont des
 * allégations qu'aucun programme ne peut tenir, que la loi encadre, et qui
 * valent des refus de publicité chez Meta comme chez TikTok. Toutes les
 * affirmations ci-dessous sont vérifiables dans le produit.
 */
const ACCROCHES = [
  {
    label: "Pas de salle à proximité",
    kicker: "Sans matériel",
    question: "Pas de salle de sport près de chez toi ?",
    reponse: "Ton salon suffit.",
  },
  {
    label: "Pas le temps",
    kicker: "3 séances par semaine",
    question: "Jamais le temps d'aller à la salle ?",
    reponse: "25 minutes chez toi, c'est tout.",
  },
  {
    label: "Appartement et voisins",
    kicker: "Sans bruit",
    question: "Tu habites en appartement ?",
    reponse: "Un programme entier sans un seul saut.",
  },
  {
    label: "Peur de mal faire",
    kicker: "70 exercices illustrés",
    question: "Peur de mal faire les mouvements ?",
    reponse: "Chacun est décomposé étape par étape.",
  },
  {
    label: "Ne sait pas commencer",
    kicker: "Pour débuter",
    question: "Tu ne sais pas par où commencer ?",
    reponse: "Un programme de 4 semaines, jour par jour.",
  },
  {
    label: "Abandonne toujours",
    kicker: "4 semaines",
    question: "Tu abandonnes au bout de deux semaines ?",
    reponse: "Des objectifs qu'on coche, pas qu'on espère.",
  },
  {
    label: "Longue pause",
    kicker: "Reprise en douceur",
    question: "Des années que tu n'as pas bougé ?",
    reponse: "On reprend sans saut et sans matériel.",
  },
  {
    label: "Prix de la salle",
    kicker: "9,99 € par mois",
    question: "Un abonnement en salle que tu n'utilises pas ?",
    reponse: "Moins de 10 € par mois, chez toi.",
  },
  {
    label: "Fessiers et jambes",
    kicker: "Bas du corps",
    question: "Muscler tes fessiers sans mettre un pied en salle ?",
    reponse: "Un cycle complet de 4 semaines à la maison.",
  },
  {
    label: "Zéro matériel",
    kicker: "À la maison",
    question: "Zéro haltère, zéro machine, zéro abonnement ?",
    reponse: "Une chaise et un mur suffisent.",
  },
] as const;

export function CarouselStudio({
  exercises,
  siteName,
  handle,
}: {
  exercises: Exercise[];
  siteName: string;
  handle: string;
}) {
  const [format, setFormat] = useState<FormatId>("carre");
  const [theme, setTheme] = useState<ThemeId>("sombre");
  const [visuel, setVisuel] = useState<VisuelId>("telephone");
  const [fond, setFond] = useState<string | null>(null);
  const [fondErreur, setFondErreur] = useState<string | null>(null);
  const [promptCopie, setPromptCopie] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | "">("");
  const [kicker, setKicker] = useState<string>(ACCROCHES[0].kicker);
  const [question, setQuestion] = useState<string>(ACCROCHES[0].question);
  const [reponse, setReponse] = useState<string>(ACCROCHES[0].reponse);
  const [ctaTitle, setCtaTitle] = useState("Le programme complet est en bio");
  const [ctaSubtitle, setCtaSubtitle] = useState(`4 semaines · ${TRIAL_DAYS} jours d'essai`);
  const [count, setCount] = useState(5);

  const pool = useMemo(
    () => (category ? exercises.filter((e) => e.category === category) : exercises),
    [exercises, category],
  );

  const [picked, setPicked] = useState<string[]>([]);
  const selected = useMemo(() => {
    const chosen = picked
      .map((slug) => pool.find((e) => e.slug === slug))
      .filter((e): e is Exercise => Boolean(e));
    // Tant que rien n'est coché, on propose automatiquement les premiers de la
    // catégorie : le studio est utilisable sans aucun réglage.
    return chosen.length > 0 ? chosen : pool.slice(0, count);
  }, [picked, pool, count]);

  const slides: Slide[] = useMemo(
    () => [
      { kind: "hook", kicker, question, reponse, exemple: selected[0] },
      ...selected.map((exercise, i) => ({
        kind: "exercise" as const,
        index: i + 1,
        total: selected.length,
        exercise,
        caption: exercise.cues[0] ?? "",
      })),
      { kind: "cta", title: ctaTitle, subtitle: ctaSubtitle },
    ],
    [kicker, question, reponse, selected, ctaTitle, ctaSubtitle],
  );

  const caption = buildCaption(question, reponse, selected, handle);

  // Les slides ne sont dessinées qu'une fois la page arrivée dans le navigateur :
  // la mise en page mesure le texte avec un canvas, qui n'existe pas côté
  // serveur. `useSyncExternalStore` distingue les deux rendus sans passer par un
  // état modifié dans un effet, qui déclencherait un second rendu en cascade.
  const monte = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Les SVG rendus dans l'aperçu, dans l'ordre, pour l'export groupé.
  const svgRefs = useRef<(SVGSVGElement | null)[]>([]);

  return (
    <div className="space-y-8">
      {/* Réglages */}
      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-2">
        <Select
          label="Format"
          value={format}
          onChange={(v) => setFormat(v as FormatId)}
          options={Object.entries(FORMATS).map(([id, f]) => ({ value: id, label: f.label }))}
        />
        <Select
          label="Thème"
          value={theme}
          onChange={(v) => setTheme(v as ThemeId)}
          options={[
            { value: "sombre", label: "Sombre" },
            { value: "or", label: "Or" },
            { value: "clair", label: "Clair" },
          ]}
        />
        <Select
          label="Style des visuels"
          value={visuel}
          onChange={(v) => setVisuel(v as VisuelId)}
          options={Object.entries(VISUELS).map(([id, label]) => ({ value: id, label }))}
        />
        <Select
          label="Catégorie d'exercices"
          value={category}
          onChange={(v) => {
            setCategory(v as Category | "");
            setPicked([]);
          }}
          options={[
            { value: "", label: "Toutes" },
            ...(Object.keys(CATEGORIES) as Category[]).map((key) => ({
              value: key,
              label: CATEGORIES[key].label,
            })),
          ]}
        />
        <label className="block">
          <span className="text-sm font-semibold text-white/80">
            Nombre d&apos;exercices : {count}
          </span>
          <input
            type="range"
            min={3}
            max={8}
            value={count}
            onChange={(e) => {
              setCount(Number(e.target.value));
              setPicked([]);
            }}
            className="mt-3 w-full accent-brand-500"
          />
        </label>

        <Text label="Étiquette (slide 1)" value={kicker} onChange={setKicker} />
        <Text label="La question qui accroche" value={question} onChange={setQuestion} />
        <Text label="La réponse, juste en dessous" value={reponse} onChange={setReponse} />
        <Text label="Appel à l'action (dernière slide)" value={ctaTitle} onChange={setCtaTitle} />
        <Text label="Sous-titre de l'appel à l'action" value={ctaSubtitle} onChange={setCtaSubtitle} />
      </div>

      {/* Accroches prêtes à l'emploi */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="font-extrabold text-white">Accroches prêtes à publier</h2>
        <p className="mt-1 text-sm leading-relaxed text-white/55">
          La première slide décide seule si quelqu&apos;un fait glisser ou passe son chemin. Chacune
          nomme un obstacle, puis le lève en une phrase. Vous pouvez les retoucher ensuite dans les
          champs ci-dessus.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ACCROCHES.map((a) => {
            const active = a.question === question;
            return (
              <button
                key={a.label}
                type="button"
                onClick={() => {
                  setKicker(a.kicker);
                  setQuestion(a.question);
                  setReponse(a.reponse);
                }}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-brand-400/20 text-brand-200 ring-1 ring-brand-400/40"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo de fond */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="font-extrabold text-white">Photo de fond (facultatif)</h2>
        <p className="mt-1 text-sm leading-relaxed text-white/55">
          Sans photo, les slides utilisent un dégradé noir et or. Avec une photo — un salon, un
          tapis, un parc — elles prennent l&apos;allure d&apos;une vraie campagne. Un voile sombre
          est posé par-dessus pour que le texte reste lisible.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-white/40">
          N&apos;utilisez que des photos dont vous avez le droit : les vôtres, ou des banques
          d&apos;images libres comme Unsplash ou Pexels. Une photo prise au hasard sur internet
          expose à une réclamation du photographe.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const fichier = e.target.files?.[0];
              setFondErreur(null);
              if (!fichier) return;
              try {
                setFond(await reduireImage(fichier));
              } catch {
                setFond(null);
                setFondErreur("Cette image n'a pas pu être lue. Essayez-en une autre.");
              }
            }}
            className="block w-full max-w-xs text-sm text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-white/15"
          />
          {fond && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fond}
                alt="Aperçu du fond"
                className="h-16 w-16 rounded-xl object-cover ring-1 ring-white/15"
              />
              <button
                type="button"
                onClick={() => setFond(null)}
                className="text-xs font-semibold text-white/60 underline"
              >
                Retirer
              </button>
            </div>
          )}
        </div>
        {fondErreur && <p className="mt-3 text-sm text-red-300">{fondErreur}</p>}

        <div className="mt-5 rounded-2xl bg-white/5 p-5">
          <h3 className="text-sm font-extrabold text-white">
            Pas de photo sous la main ? Faites-la générer
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-white/55">
            Appuyez sur une ambiance : sa description part dans le presse-papier. Collez-la dans
            ChatGPT, Gemini ou Copilot, puis importez l&apos;image obtenue avec le bouton ci-dessus.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PROMPTS_FOND.map((prompt) => (
              <button
                key={prompt.label}
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(prompt.texte);
                  setPromptCopie(prompt.label);
                }}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  promptCopie === prompt.label
                    ? "bg-brand-400/20 text-brand-200 ring-1 ring-brand-400/40"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {promptCopie === prompt.label ? `✓ ${prompt.label}` : prompt.label}
              </button>
            ))}
          </div>
          {promptCopie && (
            <p className="mt-3 text-sm font-semibold text-brand-200">
              Description copiée. Collez-la dans votre générateur d&apos;images.
            </p>
          )}
          <p className="mt-4 text-xs leading-relaxed text-white/40">
            Chaque description impose les trois contraintes qui rendent un fond utilisable : sombre
            et sans détail en haut où passe le titre, centre dégagé où se pose le téléphone, ni
            texte ni personne dans l&apos;image. Pour un carrousel carré, remplacez « format
            vertical 9:16 » par « format carré 1:1 » avant d&apos;envoyer.
          </p>
        </div>
      </div>

      {/* Choix manuel des exercices */}
      <details className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <summary className="cursor-pointer font-bold text-white">
          Choisir les exercices à la main ({selected.length} sélectionnés)
        </summary>
        <div className="mt-4 flex flex-wrap gap-2">
          {pool.map((exercise) => {
            const on = picked.includes(exercise.slug);
            return (
              <button
                key={exercise.slug}
                type="button"
                onClick={() =>
                  setPicked((current) =>
                    on ? current.filter((s) => s !== exercise.slug) : [...current, exercise.slug],
                  )
                }
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  on ? "bg-white/10 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {exercise.name}
              </button>
            );
          })}
        </div>
        {picked.length > 0 && (
          <button
            type="button"
            onClick={() => setPicked([])}
            className="mt-4 text-sm font-semibold text-white/55 underline"
          >
            Revenir à la sélection automatique
          </button>
        )}
      </details>

      {/* Aperçu + export */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-white">
            {slides.length} slides prêtes à publier
          </h2>
          <DownloadAll svgs={svgRefs} count={slides.length} format={format} />
        </div>

        {!monte && (
          <p className="mt-5 rounded-2xl bg-white/5 px-5 py-8 text-center text-sm text-white/50">
            Préparation des slides…
          </p>
        )}

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {monte &&
            slides.map((slide, i) => (
              <SlideCard
                key={i}
                slide={slide}
                position={i + 1}
                format={format}
                theme={theme}
                visuel={visuel}
                fond={fond}
                siteName={siteName}
                handle={handle}
                onMount={(node) => {
                  svgRefs.current[i] = node;
                }}
              />
            ))}
        </div>
      </div>

      {/* Légende prête à coller */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="font-extrabold text-white">Légende à coller sous la publication</h2>
        <textarea
          readOnly
          value={caption}
          rows={10}
          className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5/50 p-4 font-mono text-xs leading-relaxed text-white/80"
        />
        <button
          type="button"
          onClick={() => void navigator.clipboard.writeText(caption)}
          className="mt-3 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
        >
          Copier la légende
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- une slide

function SlideCard({
  slide,
  position,
  format,
  theme,
  visuel,
  fond,
  siteName,
  handle,
  onMount,
}: {
  slide: Slide;
  position: number;
  format: FormatId;
  theme: ThemeId;
  visuel: VisuelId;
  fond: string | null;
  siteName: string;
  handle: string;
  onMount: (node: SVGSVGElement | null) => void;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <figure className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <SlideSvg
        ref={(node) => {
          ref.current = node;
          onMount(node);
          return () => {
            ref.current = null;
            onMount(null);
          };
        }}
        slide={slide}
        format={format}
        theme={theme}
        visuel={visuel}
        fond={fond}
        uid={`s${position}`}
        siteName={siteName}
        handle={handle}
        className="w-full rounded-xl"
      />
      <figcaption className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-white/55">Slide {position}</span>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await downloadSvgAsPng(ref.current, `slide-${position}.png`, FORMATS[format]);
            } finally {
              setBusy(false);
            }
          }}
          className="rounded-full bg-ember-500 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-ember-400 disabled:opacity-60"
        >
          {busy ? "…" : "PNG"}
        </button>
      </figcaption>
    </figure>
  );
}

function DownloadAll({
  svgs,
  count,
  format,
}: {
  svgs: React.RefObject<(SVGSVGElement | null)[]>;
  /** Nombre de slides réellement affichées : le tableau de refs peut être plus long. */
  count: number;
  format: FormatId;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          // Les slides de l'aperçu sont déjà dans la page : on les exporte
          // une par une plutôt que d'en refabriquer une copie.
          const nodes = svgs.current
            .slice(0, count)
            .filter((node): node is SVGSVGElement => Boolean(node));

          // Sur téléphone, le partage envoie tout d'un coup vers Instagram.
          if (await partagerSlides(nodes, FORMATS[format])) return;

          for (let i = 0; i < nodes.length; i++) {
            await downloadSvgAsPng(nodes[i], `slide-${i + 1}.png`, FORMATS[format]);
            // Les navigateurs ignorent des téléchargements déclenchés trop vite.
            await new Promise((resolve) => setTimeout(resolve, 350));
          }
        } finally {
          setBusy(false);
        }
      }}
      className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20 disabled:opacity-60"
    >
      {busy ? "Préparation…" : "Récupérer les slides"}
    </button>
  );
}

// ------------------------------------------------------------- rendu du SVG

/**
 * Le fond d'une slide.
 *
 * Sans photo, on dessine un dégradé et une lueur dorée : c'est sobre, c'est aux
 * couleurs du site, et ça ne coûte aucun octet. Avec une photo importée, on la
 * recadre en la remplissant et on la couvre d'un voile sombre — sans ce voile,
 * un texte blanc devient illisible dès que la photo comporte un ciel clair.
 *
 * Les identifiants des dégradés portent un suffixe unique : plusieurs slides
 * vivent dans la même page, et deux dégradés de même nom se marcheraient dessus.
 */
function Fond({
  w,
  h,
  c,
  image,
  uid,
}: {
  w: number;
  h: number;
  c: (typeof THEMES)[ThemeId];
  image: string | null;
  uid: string;
}) {
  return (
    <>
      <defs>
        <linearGradient id={`degrade-${uid}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={c.bg} />
          <stop offset="100%" stopColor={c.card} />
        </linearGradient>
        <radialGradient id={`lueur-${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={c.accent} stopOpacity={0.22} />
          <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`voile-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0908" stopOpacity={0.82} />
          <stop offset="45%" stopColor="#0a0908" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#0a0908" stopOpacity={0.85} />
        </linearGradient>
      </defs>

      {image ? (
        <>
          <image
            href={image}
            x={0}
            y={0}
            width={w}
            height={h}
            preserveAspectRatio="xMidYMid slice"
          />
          <rect width={w} height={h} fill={`url(#voile-${uid})`} />
        </>
      ) : (
        <>
          <rect width={w} height={h} fill={`url(#degrade-${uid})`} />
          <ellipse cx={w * 0.5} cy={h * 0.58} rx={w * 0.75} ry={h * 0.4} fill={`url(#lueur-${uid})`} />
        </>
      )}
    </>
  );
}

function SlideSvg({
  ref,
  slide,
  format,
  theme,
  visuel,
  fond,
  uid,
  siteName,
  handle,
  className,
}: {
  ref?: React.Ref<SVGSVGElement>;
  slide: Slide;
  format: FormatId;
  theme: ThemeId;
  visuel: VisuelId;
  /** Photo de fond importée, en data URL, ou null pour le dégradé */
  fond: string | null;
  /** Rend uniques les dégradés et découpes : plusieurs slides cohabitent. */
  uid: string;
  siteName: string;
  handle: string;
  className?: string;
}) {
  const { w, h } = FORMATS[format];
  const c = THEMES[theme];
  // Police système : le SVG exporté est rastérisé hors de la page et n'a donc
  // pas accès aux polices chargées par le site.
  const font = "Helvetica Neue, Helvetica, Arial, sans-serif";

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className={className}
      style={{ display: "block", height: "auto", maxWidth: "100%" }}
    >
      <Fond w={w} h={h} c={c} image={fond} uid={uid} />

      {slide.kind === "hook" &&
        (() => {
          // Les trois blocs sont mesurés puis empilés autour du centre : à
          // positions fixes, une accroche longue chevauchait sa réponse.
          const marge = 80;
          const largeur = w - marge * 2;
          const etiquette = ajuster(slide.kicker.toUpperCase(), {
            largeurMax: largeur,
            lignesMax: 1,
            sizeMax: Math.round(w * 0.034),
            sizeMin: Math.round(w * 0.022),
            weight: 700,
            font,
            lineHeight: 1.2,
          });
          const q = ajuster(slide.question.toUpperCase(), {
            largeurMax: largeur,
            lignesMax: 5,
            sizeMax: Math.round(w * 0.098),
            sizeMin: Math.round(w * 0.05),
            weight: 800,
            font,
            lineHeight: 1.06,
          });
          const r = ajuster(slide.reponse, {
            largeurMax: largeur,
            lignesMax: 3,
            sizeMax: Math.round(w * 0.055),
            sizeMin: Math.round(w * 0.032),
            weight: 700,
            font,
            lineHeight: 1.25,
          });

          const avecTelephone = visuel === "telephone" && Boolean(slide.exemple);
          const ecartEtiquette = Math.round(w * 0.05);
          const ecartReponse = Math.round(w * 0.06);
          const total = etiquette.hauteur + ecartEtiquette + q.hauteur + ecartReponse + r.hauteur;
          // Avec le téléphone, le texte remonte pour lui laisser la place ;
          // sans lui, il se centre dans la slide.
          const hautDuBloc = avecTelephone ? h * 0.08 : h * 0.5 - total / 2;

          const yEtiquette = hautDuBloc + etiquette.size;
          const yQuestion = yEtiquette + ecartEtiquette + q.size;
          const yReponse = yQuestion + (q.hauteur - q.size) + ecartReponse + r.size;

          return (
            <>
              <BlocTexte
                bloc={etiquette}
                x={marge}
                y={yEtiquette}
                lineHeight={1.2}
                fill={c.accent}
                font={font}
                weight={700}
                letterSpacing={3}
              />
              <BlocTexte
                bloc={q}
                x={marge}
                y={yQuestion}
                lineHeight={1.06}
                fill={c.text}
                font={font}
                weight={800}
              />
              <rect
                x={marge}
                y={yReponse - r.size - Math.round(w * 0.03)}
                width={Math.round(w * 0.16)}
                height={8}
                rx={4}
                fill={c.accent}
              />
              <BlocTexte
                bloc={r}
                x={marge}
                y={yReponse}
                lineHeight={1.25}
                fill={c.accent}
                font={font}
                weight={700}
              />
              {avecTelephone && slide.exemple && (
                <Telephone
                  x={(w - Math.round(w * 0.54)) / 2}
                  // `yReponse` est la ligne de base de la PREMIÈRE ligne : sans
                  // ajouter la hauteur des suivantes, le téléphone recouvrait la
                  // fin d'une réponse sur deux lignes.
                  y={yReponse + (r.hauteur - r.size) + Math.round(w * 0.06)}
                  largeur={Math.round(w * 0.54)}
                  uid={uid}
                >
                  <EcranExercice
                    largeur={Math.round(w * 0.54)}
                    exercise={slide.exemple}
                    font={font}
                  />
                </Telephone>
              )}
              {!avecTelephone && (
                <text
                  x={marge}
                  y={h - 80}
                  fill={c.muted}
                  fontFamily={font}
                  fontSize={Math.round(w * 0.03)}
                  fontWeight={700}
                >
                  {handle} · glisse →
                </text>
              )}
            </>
          );
        })()}

      {slide.kind === "exercise" &&
        (visuel === "telephone" ? (
          (() => {
            // Le téléphone déborde volontairement par le bas : c'est ce cadrage
            // qui donne l'impression d'un produit posé dans la scène plutôt que
            // d'une capture d'écran collée au milieu.
            const marge = 80;
            const titre = ajuster(slide.exercise.name.toUpperCase(), {
              largeurMax: w - marge * 2,
              lignesMax: 2,
              sizeMax: Math.round(w * 0.085),
              sizeMin: Math.round(w * 0.048),
              weight: 800,
              font,
              lineHeight: 1.06,
            });
            const sous = ajuster(slide.caption, {
              largeurMax: w - marge * 2,
              lignesMax: 2,
              sizeMax: Math.round(w * 0.036),
              sizeMin: Math.round(w * 0.026),
              weight: 600,
              font,
              lineHeight: 1.3,
            });
            const largeurTel = Math.round(w * 0.54);
            const yTitre = Math.round(h * 0.1) + titre.size;
            const ySous = yTitre + (titre.hauteur - titre.size) + Math.round(w * 0.035) + sous.size;
            const yTel = ySous + Math.round(w * 0.06);

            return (
              <>
                <text
                  x={marge}
                  y={Math.round(h * 0.1) - Math.round(w * 0.03)}
                  fill={c.accent}
                  fontFamily={font}
                  fontSize={Math.round(w * 0.032)}
                  fontWeight={800}
                  letterSpacing={3}
                >
                  {slide.index}/{slide.total}
                </text>
                <BlocTexte
                  bloc={titre}
                  x={marge}
                  y={yTitre}
                  lineHeight={1.06}
                  fill={c.text}
                  font={font}
                  weight={800}
                />
                <BlocTexte
                  bloc={sous}
                  x={marge}
                  y={ySous}
                  lineHeight={1.3}
                  fill={c.accent}
                  font={font}
                  weight={600}
                />
                <Telephone x={(w - largeurTel) / 2} y={yTel} largeur={largeurTel} uid={uid}>
                  <EcranExercice largeur={largeurTel} exercise={slide.exercise} font={font} />
                </Telephone>
              </>
            );
          })()
        ) : (
          <>
            <text
              x={80}
              y={130}
              fill={c.accent}
              fontFamily={font}
              fontSize={Math.round(w * 0.035)}
              fontWeight={800}
              letterSpacing={2}
            >
              {slide.index}/{slide.total}
            </text>
            <BlocTexte
              bloc={ajuster(slide.exercise.name.toUpperCase(), {
                largeurMax: w - 160,
                lignesMax: 2,
                sizeMax: Math.round(w * 0.075),
                sizeMin: Math.round(w * 0.042),
                weight: 800,
                font,
                lineHeight: 1.06,
              })}
              x={80}
              y={230}
              lineHeight={1.06}
              fill={c.text}
              font={font}
              weight={800}
            />

            <rect x={80} y={h * 0.34} width={w - 160} height={h * 0.34} rx={40} fill={c.card} />
            <svg
              x={(w - h * 0.3) / 2}
              y={h * 0.36}
              width={h * 0.3}
              height={h * 0.3}
              viewBox="16 10 168 174"
            >
              <FigureBody
                pose={keyPoseOf(slide.exercise)}
                colors={{
                  stroke: theme === "sombre" ? "#eacb71" : "#0a0908",
                  strokeDim: theme === "sombre" ? "#4a443e" : "#a8a099",
                  prop: theme === "sombre" ? "#2c2825" : "#ece5d8",
                }}
              />
            </svg>

            <BlocTexte
              bloc={ajuster(slide.caption, {
                largeurMax: w - 160,
                lignesMax: 3,
                sizeMax: Math.round(w * 0.038),
                sizeMin: Math.round(w * 0.026),
                weight: 600,
                font,
                lineHeight: 1.35,
              })}
              x={80}
              y={h * 0.78}
              lineHeight={1.35}
              fill={c.muted}
              font={font}
              weight={600}
            />
            <text
              x={80}
              y={h - 80}
              fill={c.muted}
              fontFamily={font}
              fontSize={Math.round(w * 0.028)}
              fontWeight={700}
            >
              {slide.exercise.muscles.join(" · ")}
            </text>
          </>
        ))}

      {slide.kind === "cta" &&
        (() => {
          // Même empilement mesuré que l'accroche : à positions fixes, un appel
          // à l'action de trois lignes recouvrait son sous-titre et le bouton.
          const marge = 80;
          const largeur = w - marge * 2;
          const titre = ajuster(slide.title.toUpperCase(), {
            largeurMax: largeur,
            lignesMax: 4,
            sizeMax: Math.round(w * 0.09),
            sizeMin: Math.round(w * 0.05),
            weight: 800,
            font,
            lineHeight: 1.08,
          });
          const sous = ajuster(slide.subtitle, {
            largeurMax: largeur,
            lignesMax: 2,
            sizeMax: Math.round(w * 0.042),
            sizeMin: Math.round(w * 0.028),
            weight: 700,
            font,
            lineHeight: 1.3,
          });

          const hauteurBouton = Math.round(w * 0.11);
          const ecart = Math.round(w * 0.05);
          const total = titre.hauteur + ecart + sous.hauteur + ecart + hauteurBouton;
          const haut = h * 0.5 - total / 2;

          const yTitre = haut + titre.size;
          const ySous = yTitre + (titre.hauteur - titre.size) + ecart + sous.size;
          const yBouton = ySous + (sous.hauteur - sous.size) + ecart;

          return (
            <>
              <BlocTexte
                bloc={titre}
                x={marge}
                y={yTitre}
                lineHeight={1.08}
                fill={c.text}
                font={font}
                weight={800}
              />
              <BlocTexte
                bloc={sous}
                x={marge}
                y={ySous}
                lineHeight={1.3}
                fill={c.accent}
                font={font}
                weight={700}
              />
              <rect
                x={marge}
                y={yBouton}
                width={Math.round(w * 0.55)}
                height={hauteurBouton}
                rx={Math.round(hauteurBouton / 2)}
                fill={c.action}
              />
              <text
                x={marge + Math.round(w * 0.55) / 2}
                y={yBouton + Math.round(hauteurBouton * 0.66)}
                fill="#ffffff"
                fontFamily={font}
                fontSize={Math.round(w * 0.038)}
                fontWeight={800}
                textAnchor="middle"
              >
                LIEN EN BIO
              </text>
              <text
                x={marge}
                y={h - 80}
                fill={c.muted}
                fontFamily={font}
                fontSize={Math.round(w * 0.03)}
                fontWeight={700}
              >
                {siteName} · {handle}
              </text>
            </>
          );
        })()}
    </svg>
  );
}

// ------------------------------------------------------------- mise en page
//
// Le découpage se faisait en comptant les caractères, ce qui déborde forcément :
// un « M » est deux fois plus large qu'un « i », et une accroche en majuscules
// sortait du cadre. On mesure désormais le texte pour de vrai, et on réduit la
// taille jusqu'à ce qu'il tienne dans sa boîte.

let mesureur: CanvasRenderingContext2D | null | undefined;

function largeurTexte(texte: string, size: number, weight: number, font: string): number {
  if (mesureur === undefined) {
    mesureur = document.createElement("canvas").getContext("2d");
  }
  if (!mesureur) {
    // Approximation de secours si le canvas est indisponible.
    return texte.length * size * 0.58;
  }
  mesureur.font = `${weight} ${size}px ${font}`;
  return mesureur.measureText(texte).width;
}

type Bloc = { lignes: string[]; size: number; hauteur: number };

/**
 * Découpe un texte pour qu'il tienne dans une largeur et un nombre de lignes
 * donnés, en réduisant la taille de police si nécessaire.
 */
function ajuster(
  texte: string,
  {
    largeurMax,
    lignesMax,
    sizeMax,
    sizeMin,
    weight,
    font,
    lineHeight,
  }: {
    largeurMax: number;
    lignesMax: number;
    sizeMax: number;
    sizeMin: number;
    weight: number;
    font: string;
    lineHeight: number;
  },
): Bloc {
  const mots = texte.split(/\s+/).filter(Boolean);
  const pas = Math.max(1, Math.round(sizeMax * 0.04));

  for (let size = sizeMax; size >= sizeMin; size -= pas) {
    const lignes: string[] = [];
    let courante = "";
    let motTropLarge = false;

    for (const mot of mots) {
      const essai = courante ? `${courante} ${mot}` : mot;
      if (largeurTexte(essai, size, weight, font) <= largeurMax) {
        courante = essai;
        continue;
      }
      if (courante) lignes.push(courante);
      courante = mot;
      if (largeurTexte(mot, size, weight, font) > largeurMax) {
        motTropLarge = true;
        break;
      }
    }
    if (motTropLarge) continue;
    if (courante) lignes.push(courante);

    if (lignes.length <= lignesMax) {
      return { lignes, size, hauteur: (lignes.length - 1) * size * lineHeight + size };
    }
  }

  // Aucune taille ne convient : on rend au minimum plutôt que de ne rien rendre.
  const lignes: string[] = [];
  let courante = "";
  for (const mot of mots) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (largeurTexte(essai, sizeMin, weight, font) <= largeurMax) courante = essai;
    else {
      if (courante) lignes.push(courante);
      courante = mot;
    }
  }
  if (courante) lignes.push(courante);
  return {
    lignes,
    size: sizeMin,
    hauteur: (lignes.length - 1) * sizeMin * lineHeight + sizeMin,
  };
}

/** Empile les lignes d'un bloc déjà ajusté, première ligne à `y`. */
function BlocTexte({
  bloc,
  x,
  y,
  lineHeight,
  fill,
  font,
  weight,
  letterSpacing,
}: {
  bloc: Bloc;
  x: number;
  y: number;
  lineHeight: number;
  fill: string;
  font: string;
  weight: number;
  letterSpacing?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontFamily={font}
      fontSize={bloc.size}
      fontWeight={weight}
      letterSpacing={letterSpacing}
    >
      {bloc.lignes.map((ligne, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : bloc.size * lineHeight}>
          {ligne}
        </tspan>
      ))}
    </text>
  );
}

/**
 * Réduit et recompresse une photo importée avant de l'embarquer dans le SVG.
 *
 * Une photo de téléphone pèse plusieurs mégaoctets ; encodée en base64 dans
 * chacune des sept slides, elle rendrait l'aperçu poussif et l'export très lent.
 * 1400 px de côté suffisent largement pour un visuel de 1080 px.
 */
async function reduireImage(fichier: File): Promise<string> {
  const bitmap = await createImageBitmap(fichier);
  const facteur = Math.min(1, FOND_MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * facteur);
  canvas.height = Math.round(bitmap.height * facteur);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.82);
}

// -------------------------------------------------------------------- export

/** Rastérise une slide et rend le PNG, sans le télécharger. */
async function svgVersPng(
  svg: SVGSVGElement | null,
  size: { w: number; h: number },
): Promise<Blob | null> {
  if (!svg) return null;

  const source = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));

  try {
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(image, 0, 0, size.w, size.h);
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function downloadSvgAsPng(
  svg: SVGSVGElement | null,
  filename: string,
  size: { w: number; h: number },
) {
  const blob = await svgVersPng(svg, size);
  if (!blob) return;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 2000);
}

/**
 * Envoie toutes les slides d'un coup vers le partage du téléphone.
 *
 * Sur mobile, enchaîner sept téléchargements ne fonctionne pas : le navigateur
 * bloque tout après le premier, et l'utilisateur croit que le bouton est cassé.
 * Le partage natif règle le problème et raccourcit le trajet — les images
 * partent directement vers Instagram sans passer par la galerie.
 *
 * Rend false quand le partage de fichiers n'est pas disponible, pour laisser
 * l'appelant retomber sur des téléchargements classiques.
 */
async function partagerSlides(
  svgs: (SVGSVGElement | null)[],
  size: { w: number; h: number },
): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;

  const fichiers: File[] = [];
  for (let i = 0; i < svgs.length; i++) {
    const blob = await svgVersPng(svgs[i], size);
    if (blob) fichiers.push(new File([blob], `slide-${i + 1}.png`, { type: "image/png" }));
  }
  if (fichiers.length === 0 || !navigator.canShare({ files: fichiers })) return false;

  try {
    await navigator.share({ files: fichiers, title: "Carrousel ATLAS" });
    return true;
  } catch {
    // L'utilisateur a fermé la feuille de partage : rien à signaler.
    return true;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

// ---------------------------------------------------------------- légende

function buildCaption(
  question: string,
  reponse: string,
  exercises: Exercise[],
  handle: string,
): string {
  const list = exercises.map((e, i) => `${i + 1}. ${e.name} — ${e.cues[0] ?? ""}`).join("\n");
  const tags = [
    "#fitnessmaison",
    "#sportalamaison",
    "#musculationmaison",
    "#remiseenforme",
    "#sansmateriel",
    "#programmesportif",
    "#motivationsport",
    "#fitnessfrance",
    "#perdredupoids",
    "#renforcementmusculaire",
  ];

  return [
    question,
    `${reponse} 👇`,
    "",
    list,
    "",
    "Enregistre ce post pour ta prochaine séance 📌",
    `Le programme complet de 4 semaines est en bio → ${handle}`,
    "",
    tags.join(" "),
  ].join("\n");
}

// ----------------------------------------------------------------- champs

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-white/15 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
      />
    </label>
  );
}
