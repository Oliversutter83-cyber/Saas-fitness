"use client";

import { useMemo, useRef, useState } from "react";
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

const THEMES = {
  sombre: { bg: "#0d1412", text: "#ffffff", muted: "#8ba39a", accent: "#9ff05e", card: "#16211e" },
  clair: { bg: "#f2fee7", text: "#0d1412", muted: "#4a635b", accent: "#47a006", card: "#ffffff" },
} as const;

type ThemeId = keyof typeof THEMES;

type Slide =
  | { kind: "hook"; title: string; kicker: string }
  | { kind: "exercise"; index: number; total: number; exercise: Exercise; caption: string }
  | { kind: "cta"; title: string; subtitle: string };

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
  const [category, setCategory] = useState<Category | "">("");
  const [hook, setHook] = useState("5 exercices pour se muscler sans matériel");
  const [kicker, setKicker] = useState("À faire chez soi, 20 minutes");
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
      { kind: "hook", title: hook, kicker },
      ...selected.map((exercise, i) => ({
        kind: "exercise" as const,
        index: i + 1,
        total: selected.length,
        exercise,
        caption: exercise.cues[0] ?? "",
      })),
      { kind: "cta", title: ctaTitle, subtitle: ctaSubtitle },
    ],
    [hook, kicker, selected, ctaTitle, ctaSubtitle],
  );

  const caption = buildCaption(hook, selected, handle);

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
            { value: "clair", label: "Clair" },
          ]}
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

        <Text label="Accroche (slide 1)" value={hook} onChange={setHook} />
        <Text label="Sous-titre (slide 1)" value={kicker} onChange={setKicker} />
        <Text label="Appel à l'action (dernière slide)" value={ctaTitle} onChange={setCtaTitle} />
        <Text label="Sous-titre de l'appel à l'action" value={ctaSubtitle} onChange={setCtaSubtitle} />
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

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, i) => (
            <SlideCard
              key={i}
              slide={slide}
              position={i + 1}
              format={format}
              theme={theme}
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
  siteName,
  handle,
  onMount,
}: {
  slide: Slide;
  position: number;
  format: FormatId;
  theme: ThemeId;
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
      {busy ? "Export en cours…" : "Télécharger toutes les slides"}
    </button>
  );
}

// ------------------------------------------------------------- rendu du SVG

function SlideSvg({
  ref,
  slide,
  format,
  theme,
  siteName,
  handle,
  className,
}: {
  ref?: React.Ref<SVGSVGElement>;
  slide: Slide;
  format: FormatId;
  theme: ThemeId;
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
      <rect width={w} height={h} fill={c.bg} />

      {slide.kind === "hook" && (
        <>
          <WrappedText
            text={slide.title.toUpperCase()}
            x={80}
            y={h * 0.34}
            maxChars={16}
            size={Math.round(w * 0.105)}
            lineHeight={1.06}
            fill={c.text}
            font={font}
            weight={800}
          />
          <text
            x={80}
            y={h * 0.34 - Math.round(w * 0.105) * 1.5}
            fill={c.accent}
            fontFamily={font}
            fontSize={Math.round(w * 0.032)}
            fontWeight={700}
            letterSpacing={3}
          >
            {slide.kicker.toUpperCase()}
          </text>
          <rect x={80} y={h * 0.62} width={w * 0.24} height={10} rx={5} fill={c.accent} />
          <text
            x={80}
            y={h - 80}
            fill={c.muted}
            fontFamily={font}
            fontSize={Math.round(w * 0.03)}
            fontWeight={700}
          >
            {handle} · glisse →
          </text>
        </>
      )}

      {slide.kind === "exercise" && (
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
          <WrappedText
            text={slide.exercise.name.toUpperCase()}
            x={80}
            y={230}
            maxChars={18}
            size={Math.round(w * 0.075)}
            lineHeight={1.06}
            fill={c.text}
            font={font}
            weight={800}
          />

          <rect
            x={80}
            y={h * 0.34}
            width={w - 160}
            height={h * 0.34}
            rx={40}
            fill={c.card}
          />
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
                stroke: theme === "sombre" ? "#e0fcc9" : "#0d1412",
                strokeDim: theme === "sombre" ? "#4a635b" : "#a7b6b1",
                prop: theme === "sombre" ? "#22322d" : "#e6ece9",
              }}
            />
          </svg>

          <WrappedText
            text={slide.caption}
            x={80}
            y={h * 0.78}
            maxChars={34}
            size={Math.round(w * 0.038)}
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
      )}

      {slide.kind === "cta" && (
        <>
          <WrappedText
            text={slide.title.toUpperCase()}
            x={80}
            y={h * 0.4}
            maxChars={15}
            size={Math.round(w * 0.095)}
            lineHeight={1.08}
            fill={c.text}
            font={font}
            weight={800}
          />
          <text
            x={80}
            y={h * 0.52}
            fill={c.accent}
            fontFamily={font}
            fontSize={Math.round(w * 0.042)}
            fontWeight={700}
          >
            {slide.subtitle}
          </text>
          <rect
            x={80}
            y={h * 0.6}
            width={w * 0.55}
            height={Math.round(w * 0.11)}
            rx={Math.round(w * 0.055)}
            fill={c.accent}
          />
          <text
            x={80 + (w * 0.55) / 2}
            y={h * 0.6 + Math.round(w * 0.072)}
            fill="#0d1412"
            fontFamily={font}
            fontSize={Math.round(w * 0.038)}
            fontWeight={800}
            textAnchor="middle"
          >
            LIEN EN BIO
          </text>
          <text
            x={80}
            y={h - 80}
            fill={c.muted}
            fontFamily={font}
            fontSize={Math.round(w * 0.03)}
            fontWeight={700}
          >
            {siteName} · {handle}
          </text>
        </>
      )}
    </svg>
  );
}

/** Découpe un texte en lignes et les empile en <tspan>. */
function WrappedText({
  text,
  x,
  y,
  maxChars,
  size,
  lineHeight,
  fill,
  font,
  weight,
}: {
  text: string;
  x: number;
  y: number;
  maxChars: number;
  size: number;
  lineHeight: number;
  fill: string;
  font: string;
  weight: number;
}) {
  const lines = wrap(text, maxChars);
  return (
    <text x={x} y={y} fill={fill} fontFamily={font} fontSize={size} fontWeight={weight}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size * lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (`${current} ${word}`.length <= maxChars) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// -------------------------------------------------------------------- export

async function downloadSvgAsPng(
  svg: SVGSVGElement | null,
  filename: string,
  size: { w: number; h: number },
) {
  if (!svg) return;

  const source = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));

  try {
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, size.w, size.h);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
  } finally {
    URL.revokeObjectURL(url);
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

function buildCaption(hook: string, exercises: Exercise[], handle: string): string {
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
    `${hook} 👇`,
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
