"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedFigure } from "@/components/AnimatedFigure";
import { Figure } from "@/components/Figure";
import { OrbitFigure3D } from "@/components/Figure3D";
import { useAnimatedPose3D } from "@/components/useAnimatedPose";
import type { Exercise } from "@/content/exercises";

/**
 * Le remplaçant de la vidéo.
 *
 * Deux modes complémentaires :
 *  - « Animation » : le mouvement joué en continu, articulations interpolées,
 *    pour comprendre le geste d'un coup d'œil ;
 *  - « Étapes » : les positions clés une par une, qu'on fait défiler au doigt
 *    pour lire tranquillement la consigne de chaque temps ;
 *  - « Volume » : le même mouvement avec de la profondeur, qu'on fait tourner
 *    pour le voir de face, de dos et des deux côtés. C'est ce mode qui répond
 *    aux questions qu'une vue de profil laisse en suspens — l'écartement des
 *    mains, l'alignement des genoux — quand on découvre un exercice.
 *
 * Le défilement natif avec scroll-snap est volontairement conservé en mode
 * étapes : c'est lui qui donne le geste tactile fluide sur mobile, sans
 * librairie.
 */
export function ExerciseCarousel({
  exercise,
  compact = false,
  className = "",
}: {
  exercise: Exercise;
  compact?: boolean;
  className?: string;
}) {
  const steps = exercise.steps;
  const trackRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"anim" | "steps" | "volume">(
    steps.length > 1 ? "anim" : "steps",
  );
  const [index, setIndex] = useState(0);

  const figureHeight = compact ? "h-44 w-full" : "h-64 w-full sm:h-72";

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[i] as HTMLElement | undefined;
    if (slide) track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  }, []);

  // En mode étapes, l'index actif suit le défilement réel plutôt qu'un état
  // séparé : le doigt de l'utilisateur et les boutons restent toujours d'accord.
  useEffect(() => {
    if (mode !== "steps") return;
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        setIndex(Math.max(0, Math.min(steps.length - 1, i)));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, [mode, steps.length]);

  const step = steps[index];

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
        {mode === "anim" ? (
          <AnimatedFigure
            poses={steps.map((s) => s.pose)}
            className={figureHeight}
            onSegmentChange={setIndex}
          />
        ) : mode === "volume" ? (
          <VolumeView exercise={exercise} figureHeight={figureHeight} />
        ) : (
          <div
            ref={trackRef}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
            role="group"
            aria-roledescription="carrousel"
            aria-label={`Étapes du mouvement : ${exercise.name}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") goTo(Math.min(index + 1, steps.length - 1));
              if (e.key === "ArrowLeft") goTo(Math.max(index - 1, 0));
            }}
          >
            {steps.map((s, i) => (
              <div
                key={i}
                className="w-full shrink-0 snap-center"
                aria-roledescription="diapositive"
                aria-label={`Étape ${i + 1} sur ${steps.length} : ${s.title}`}
              >
                <Figure pose={s.pose} className={figureHeight} />
              </div>
            ))}
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-ink-950/80 px-2.5 py-1 text-xs font-semibold text-brand-300 tabular-nums">
          {index + 1} / {steps.length}
        </span>

        {mode === "steps" && steps.length > 1 && (
          <>
            <CarouselButton
              side="left"
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
              label="Étape précédente"
            />
            <CarouselButton
              side="right"
              disabled={index === steps.length - 1}
              onClick={() => goTo(index + 1)}
              label="Étape suivante"
            />
          </>
        )}
      </div>

      {/*
        Le sélecteur « Animer / Étapes » ne se comprime pas : sur un écran très
        étroit (320 px), il poussait la carte au-delà du bord de l'écran et toute
        la page devenait défilable horizontalement. On autorise donc le retour à
        la ligne plutôt que le débordement.
      */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {mode === "steps" ? (
          <div className="flex gap-1.5" role="tablist" aria-label="Étapes">
            {steps.map((s, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Étape ${i + 1} : ${s.title}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-brand-400" : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        ) : mode === "volume" ? (
          <p className="whitespace-nowrap text-xs font-semibold text-brand-300">
            ● Faites tourner
          </p>
        ) : (
          <p className="whitespace-nowrap text-xs font-semibold text-brand-300">● En mouvement</p>
        )}

        {/*
          « Volume » est proposé même sur une posture unique — un étirement, un
          gainage : tourner autour d'une position tenue est précisément ce qui
          permet de vérifier qu'on la reproduit bien.
        */}
        <div className="flex shrink-0 rounded-full bg-white/5 p-0.5">
          {steps.length > 1 && (
            <>
              <ModeButton active={mode === "anim"} onClick={() => setMode("anim")}>
                ▶ Animer
              </ModeButton>
              <ModeButton
                active={mode === "steps"}
                onClick={() => {
                  setMode("steps");
                  setIndex(0);
                }}
              >
                Étapes
              </ModeButton>
            </>
          )}
          <ModeButton active={mode === "volume"} onClick={() => setMode("volume")}>
            ⬢ Volume
          </ModeButton>
        </div>
      </div>

      {/*
        En mode animation, toutes les étapes restent affichées en même temps :
        une légende qui changerait au rythme du geste défilerait trop vite pour
        être lue. L'étape en cours est seulement mise en évidence, et le texte
        se lit à son propre rythme pendant que le mouvement tourne en boucle.
      */}
      {mode !== "steps" ? (
        <ol className="mt-3 space-y-2">
          {steps.map((s, i) => (
            <li
              key={i}
              className={`rounded-xl px-3 py-2 transition-colors duration-500 ${
                i === index ? "bg-brand-400/10 ring-1 ring-brand-400/25" : ""
              }`}
            >
              <p
                className={`text-sm font-bold transition-colors duration-500 ${
                  i === index ? "text-brand-200" : "text-white/80"
                }`}
              >
                {i + 1}. {s.title}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-white/55">{s.detail}</p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-3 min-h-[5.5rem]">
          <p className="text-sm font-bold text-white">
            {index + 1}. {step.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-white/60">{step.detail}</p>
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${
        active ? "bg-brand-400 text-ink-950" : "text-white/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Le mouvement en volume. La posture animée est calculée ici puis confiée à la
 * vue pivotable : le geste et la rotation avancent indépendamment, on peut donc
 * tourner autour d'un mouvement qui continue de se jouer.
 */
function VolumeView({
  exercise,
  figureHeight,
}: {
  exercise: Exercise;
  figureHeight: string;
}) {
  const pose = useAnimatedPose3D(
    exercise.steps.map((s) => s.pose),
    true,
  );
  return <OrbitFigure3D pose={pose} className={`${figureHeight} px-2 pb-2 pt-1`} />;
}

function CarouselButton({
  side,
  disabled,
  onClick,
  label,
}: {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`absolute top-1/2 -translate-y-1/2 ${
        side === "left" ? "left-2" : "right-2"
      } grid h-9 w-9 place-items-center rounded-full bg-ink-950/70 text-white ring-1 ring-white/15 transition hover:bg-ink-950 disabled:pointer-events-none disabled:opacity-0`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path
          d={side === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
