"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ExerciseCarousel } from "@/components/ExerciseCarousel";
import { formatClock, type Entry } from "@/content/playlist";

/**
 * Le lecteur de séance : une étape à la fois, un chronomètre, et le carrousel
 * du mouvement en cours. L'utilisateur pose son téléphone et suit.
 *
 * Le temps est mesuré sur l'horloge système plutôt qu'en décrémentant un
 * compteur : sur mobile, les timers sont ralentis dès que l'écran s'éteint ou
 * que l'onglet passe en arrière-plan, et une séance finirait décalée.
 */

type Props = {
  entries: Entry[];
  /** Titre affiché sur l'écran de fin, ex. « Semaine 2 · Séance 1 — Bas du corps » */
  sessionTitle: string;
  backHref: string;
  onFinish: (durationSec: number, feeling: number | null) => Promise<void>;
};

export function SessionPlayer({ entries, sessionTitle, backHref, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState<number>(entryDuration(entries[0]) ?? 0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  const entry = entries[index];
  const duration = entryDuration(entry);
  const deadlineRef = useRef<number | null>(null);
  /** Instant du dernier démarrage, et temps déjà cumulé avant celui-ci. */
  const startedAtRef = useRef<number | null>(null);
  const elapsedBeforeRef = useRef(0);

  const total = useMemo(
    () => entries.reduce((sum, e) => sum + (entryDuration(e) ?? 0), 0),
    [entries],
  );

  const goToIndex = useCallback(
    (next: number) => {
      if (next >= entries.length) {
        setRunning(false);
        setDone(true);
        return;
      }
      const clamped = Math.max(0, next);
      setIndex(clamped);
      const nextDuration = entryDuration(entries[clamped]);
      setRemaining(nextDuration ?? 0);
      deadlineRef.current = nextDuration != null ? Date.now() + nextDuration * 1000 : null;
    },
    [entries],
  );

  // Chronomètre : on relit l'horloge à chaque tick au lieu de compter les ticks.
  // Compter les ticks donnerait un temps faux (l'intervalle bat 4 fois par
  // seconde) et dérive dès que le navigateur ralentit les timers en arrière-plan.
  useEffect(() => {
    if (!running) return;

    startedAtRef.current = Date.now();
    if (duration != null && deadlineRef.current == null) {
      deadlineRef.current = Date.now() + remaining * 1000;
    }

    const tick = setInterval(() => {
      if (startedAtRef.current != null) {
        const runningFor = (Date.now() - startedAtRef.current) / 1000;
        setElapsed(Math.round(elapsedBeforeRef.current + runningFor));
      }

      if (deadlineRef.current == null) return;
      const left = Math.round((deadlineRef.current - Date.now()) / 1000);
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        beep();
        deadlineRef.current = null;
        setIndex((current) => {
          const next = current + 1;
          if (next >= entries.length) {
            setRunning(false);
            setDone(true);
            return current;
          }
          const nextDuration = entryDuration(entries[next]);
          setRemaining(nextDuration ?? 0);
          deadlineRef.current = nextDuration != null ? Date.now() + nextDuration * 1000 : null;
          return next;
        });
      }
    }, 250);

    return () => clearInterval(tick);
    // `remaining` n'est volontairement pas dans les dépendances : il change à
    // chaque tick et relancerait l'intervalle en boucle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, duration, entries]);

  // Garder l'écran allumé pendant la séance quand le navigateur le permet.
  useEffect(() => {
    if (!running || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    navigator.wakeLock
      .request("screen")
      .then((lock) => {
        if (cancelled) void lock.release();
        else sentinel = lock;
      })
      .catch(() => {
        // Refus du navigateur : la séance fonctionne quand même.
      });

    return () => {
      cancelled = true;
      void sentinel?.release();
    };
  }, [running]);

  if (done) {
    return (
      <Summary
        durationSec={elapsed}
        sessionTitle={sessionTitle}
        backHref={backHref}
        onFinish={onFinish}
      />
    );
  }

  const progress = Math.min(100, (index / entries.length) * 100);
  const isRest = entry.type === "rest";

  return (
    <div className={`min-h-dvh ${isRest ? "bg-ink-950" : "bg-ink-900"}`}>
      {/* Barre de progression + sortie */}
      <div className={`sticky top-0 z-30 ${isRest ? "bg-ink-950" : "bg-ink-900"}`}>
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-5 py-4">
          <Link
            href={backHref}
            className={`text-sm font-semibold ${isRest ? "text-white/50" : "text-white/55"}`}
          >
            ✕
          </Link>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-brand-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span
            className={`text-xs font-bold tabular-nums ${isRest ? "text-white/50" : "text-white/55"}`}
          >
            {formatClock(elapsed)} / ~{formatClock(total)}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 pb-40">
        {entry.type === "rest" ? (
          <div className="flex flex-col items-center pt-16 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-300">
              {entry.betweenRounds ? "Repos entre les tours" : "Récupération"}
            </p>
            <p className="mt-6 text-8xl font-extrabold tabular-nums text-white">{remaining}</p>
            <p className="mt-6 text-white/50">Ensuite</p>
            <p className="text-2xl font-extrabold text-white">{entry.nextName}</p>
          </div>
        ) : (
          <div className="pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-300">
              {entry.blockTitle}
              {entry.totalRounds > 1 && ` · tour ${entry.round}/${entry.totalRounds}`}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">
              {entry.exercise.name}
            </h1>

            <p className="mt-2 text-2xl font-extrabold tabular-nums text-brand-300">
              {entry.reps ? `${entry.reps} répétitions` : `${remaining} s`}
            </p>

            {entry.note && (
              <p className="mt-3 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-brand-100">
                💡 {entry.note}
              </p>
            )}

            <ExerciseCarousel exercise={entry.exercise} className="mt-5" />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-300">À faire</p>
                <ul className="mt-2 space-y-1 text-sm text-white/70">
                  {entry.exercise.cues.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-red-500/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-red-300">À éviter</p>
                <ul className="mt-2 space-y-1 text-sm text-white/70">
                  {entry.exercise.mistakes.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-4 text-sm text-white/55">
              <strong className="text-white/80">Respiration :</strong> {entry.exercise.breathing}
            </p>
          </div>
        )}
      </div>

      {/* Commandes */}
      <div
        className={`fixed inset-x-0 bottom-0 border-t ${
          isRest ? "border-white/10 bg-ink-950" : "border-white/10 bg-ink-900"
        }`}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-4">
          <button
            type="button"
            onClick={() => goToIndex(index - 1)}
            disabled={index === 0}
            aria-label="Étape précédente"
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg disabled:opacity-30 ${
              isRest ? "bg-white/10 text-white" : "bg-white/5 text-white/80"
            }`}
          >
            ↺
          </button>

          {!running ? (
            <button
              type="button"
              onClick={() => {
                setRunning(true);
                if (duration != null) deadlineRef.current = Date.now() + remaining * 1000;
              }}
              className="flex-1 rounded-full bg-ember-500 py-3.5 font-extrabold text-white transition hover:bg-ember-400"
            >
              {elapsed === 0 ? "Démarrer la séance" : "Reprendre"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  // On fige le temps déjà couru : la reprise repartira de là.
                  if (startedAtRef.current != null) {
                    elapsedBeforeRef.current += (Date.now() - startedAtRef.current) / 1000;
                    startedAtRef.current = null;
                  }
                  setRunning(false);
                  deadlineRef.current = null;
                }}
                className={`flex-1 rounded-full py-3.5 font-bold ${
                  isRest ? "bg-white/10 text-white" : "bg-white/5 text-white/80"
                }`}
              >
                Pause
              </button>
              <button
                type="button"
                onClick={() => goToIndex(index + 1)}
                className="flex-1 rounded-full bg-ember-500 py-3.5 font-extrabold text-white transition hover:bg-ember-400"
              >
                {entry.type === "rest" ? "Passer le repos" : "Terminé →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function entryDuration(entry: Entry | undefined): number | null {
  if (!entry) return null;
  if (entry.type === "rest") return entry.seconds;
  return entry.seconds;
}

/** Bip de fin d'étape, synthétisé : pas de fichier audio à charger. */
function beep() {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
    setTimeout(() => void ctx.close(), 400);
  } catch {
    // Le son n'est qu'un confort : on ignore tout refus du navigateur.
  }
}

function Summary({
  durationSec,
  sessionTitle,
  backHref,
  onFinish,
}: {
  durationSec: number;
  sessionTitle: string;
  backHref: string;
  onFinish: (durationSec: number, feeling: number | null) => Promise<void>;
}) {
  const [feeling, setFeeling] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const FEELINGS = [
    { value: 1, emoji: "😵", label: "Trop dur" },
    { value: 2, emoji: "😮‍💨", label: "Dur" },
    { value: 3, emoji: "🙂", label: "Bien" },
    { value: 4, emoji: "😃", label: "Facile" },
    { value: 5, emoji: "🦾", label: "Trop facile" },
  ];

  return (
    <div className="grid min-h-dvh place-items-center bg-ink-950 px-5 py-16">
      <div className="w-full max-w-md text-center">
        <p className="text-6xl" aria-hidden>
          🎉
        </p>
        <h1 className="mt-6 text-3xl font-extrabold text-white">Séance terminée !</h1>
        <p className="mt-2 text-white/50">{sessionTitle}</p>

        <p className="mt-8 text-5xl font-extrabold tabular-nums text-brand-300">
          {formatClock(durationSec)}
        </p>
        <p className="text-sm text-white/40">temps d&apos;entraînement</p>

        <p className="mt-10 text-sm font-semibold text-white/70">Comment c&apos;était ?</p>
        <div className="mt-3 flex justify-center gap-2">
          {FEELINGS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFeeling(f.value)}
              aria-pressed={feeling === f.value}
              title={f.label}
              className={`grid h-14 w-14 place-items-center rounded-2xl text-2xl transition ${
                feeling === f.value ? "bg-brand-400" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {f.emoji}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onFinish(durationSec, feeling);
          }}
          className="mt-10 w-full rounded-full bg-ember-500 py-4 font-extrabold text-white transition hover:bg-ember-400 disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer ma séance"}
        </button>

        <Link href={backHref} className="mt-4 block text-sm text-white/40 hover:text-white/70">
          Quitter sans enregistrer
        </Link>
      </div>
    </div>
  );
}
