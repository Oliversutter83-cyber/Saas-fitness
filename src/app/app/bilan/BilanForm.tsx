"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { genererBilan, type BilanState } from "./actions";

/**
 * Formulaire du bilan.
 *
 * La photo est réduite ET recompressée dans le navigateur avant tout envoi :
 * une photo de téléphone fait 3 à 8 Mo, ce qui ferait échouer l'envoi et
 * transmettrait bien plus de détail que nécessaire. On envoie une image de
 * 640 px de côté au maximum, en JPEG.
 */

const MAX_SIDE = 640;

async function shrinkImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.8);
}

const GOALS = [
  { value: "perte-de-poids", label: "Perdre du poids" },
  { value: "forme", label: "Me remettre en forme" },
  { value: "muscle", label: "Me muscler" },
  { value: "fessiers", label: "Fessiers & jambes" },
];

const LEVELS = [
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "avance", label: "Confirmé" },
];

const MINUTES = [
  { value: "15", label: "15 min" },
  { value: "25", label: "25 min" },
  { value: "40", label: "40 min et plus" },
];

const JUMP = [
  { value: "oui", label: "Oui, sans problème" },
  { value: "non", label: "Non — voisins ou articulations" },
];

const LAST_ACTIVE = [
  { value: "actif", label: "Je m'entraîne déjà" },
  { value: "quelques-mois", label: "Quelques mois" },
  { value: "plus-un-an", label: "Plus d'un an" },
  { value: "jamais", label: "Jamais vraiment" },
];

const BLOCKERS = [
  { value: "aucun", label: "Rien de particulier" },
  { value: "temps", label: "Le manque de temps" },
  { value: "motivation", label: "La motivation" },
  { value: "douleurs", label: "Des douleurs" },
];

export function BilanForm() {
  const [state, formAction] = useActionState<BilanState, FormData>(genererBilan, undefined);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  async function onPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPhotoError(null);
    if (!file) {
      setPreview(null);
      return;
    }
    try {
      setPreview(await shrinkImage(file));
    } catch {
      setPreview(null);
      setPhotoError("Cette image n'a pas pu être lue. Essayez une autre photo, ou passez cette étape.");
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* La data URL réduite voyage dans un champ caché, pas le fichier brut */}
      <input type="hidden" name="photo" value={preview ?? ""} />

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="font-extrabold text-white">Votre photo de départ</h2>
        <p className="mt-1 text-sm leading-relaxed text-white/55">
          Facultative. Elle sert à deux choses : adapter les conseils à votre espace
          d&apos;entraînement, et vous donner un point de comparaison dans quatre semaines.
          Elle est réduite sur votre téléphone avant l&apos;envoi.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
            className="block w-full max-w-xs text-sm text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-white/15"
          />
          {preview && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Aperçu de votre photo de départ"
                className="h-20 w-20 rounded-xl object-cover ring-1 ring-white/15"
              />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  if (photoRef.current) photoRef.current.value = "";
                }}
                className="text-xs font-semibold text-white/60 underline"
              >
                Retirer
              </button>
            </div>
          )}
        </div>

        {photoError && <p className="mt-3 text-sm text-red-300">{photoError}</p>}

        {preview && (
          <label className="mt-4 flex items-start gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              name="keepPhoto"
              className="mt-0.5 h-4 w-4 accent-brand-400"
            />
            <span>
              Garder cette photo dans mon espace pour la comparer plus tard.
              <span className="mt-0.5 block text-xs text-white/45">
                Sans cette case, la photo sert au bilan puis n&apos;est pas conservée.
              </span>
            </span>
          </label>
        )}
      </section>

      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-3">
        <Field label="Âge" name="age" type="number" min={14} max={100} required suffix="ans" />
        <Field label="Taille" name="heightCm" type="number" min={120} max={230} required suffix="cm" />
        <Field
          label="Poids"
          name="weightKg"
          type="number"
          step="0.1"
          min={30}
          max={300}
          required
          suffix="kg"
        />
      </section>

      <section className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <Choice label="Votre objectif" name="goal" options={GOALS} defaultValue="forme" />
        <Choice label="Votre niveau" name="level" options={LEVELS} defaultValue="debutant" />

        <label className="block">
          <span className="text-sm font-semibold text-white/80">
            Combien de jours par semaine pouvez-vous vous entraîner ?
          </span>
          <select
            name="daysPerWeek"
            defaultValue="3"
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-ink-900 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-400 sm:max-w-xs"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n} jour{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>

        <Choice
          label="Combien de temps avez-vous par séance ?"
          hint="Le plan annonce ce temps-là, et vous dit quoi retirer pour y tenir."
          name="minutesAvailable"
          options={MINUTES}
          defaultValue="25"
        />

        <Choice
          label="Pouvez-vous sauter chez vous ?"
          hint="Si non, chaque mouvement avec impact est remplacé par sa version au sol."
          name="canJump"
          options={JUMP}
          defaultValue="oui"
        />

        <Choice
          label="Depuis combien de temps n'avez-vous plus d'entraînement régulier ?"
          hint="C'est ce qui décide du point de départ, davantage que le niveau ressenti."
          name="lastActive"
          options={LAST_ACTIVE}
          defaultValue="plus-un-an"
        />

        <Choice
          label="Qu'est-ce qui vous a fait arrêter la dernière fois ?"
          hint="Le plan est construit pour éviter de reproduire ce scénario."
          name="blocker"
          options={BLOCKERS}
          defaultValue="aucun"
        />

        <label className="block">
          <span className="text-sm font-semibold text-white/80">
            Blessures, douleurs ou contraintes ? (facultatif)
          </span>
          <input
            name="constraints"
            type="text"
            maxLength={400}
            placeholder="Genou droit sensible, appartement au 3e sans ascenseur…"
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand-400"
          />
        </label>
      </section>

      {state?.error && (
        <p role="alert" className="rounded-2xl bg-red-500/10 px-5 py-4 text-sm font-medium text-red-300">
          {state.error}
        </p>
      )}

      <Submit hasPhoto={Boolean(preview)} />

      <p className="text-xs leading-relaxed text-white/40">
        Ce bilan est un plan d&apos;entraînement, pas un avis médical. Il ne remplace pas la
        consultation d&apos;un professionnel de santé, et aucune mesure corporelle n&apos;est
        déduite de votre photo.
      </p>
    </form>
  );
}

function Submit({ hasPhoto }: { hasPhoto: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-ember-500 py-4 font-extrabold text-white transition hover:bg-ember-400 disabled:opacity-60"
    >
      {pending
        ? hasPhoto
          ? "Analyse en cours…"
          : "Génération du plan…"
        : "Générer mon bilan"}
    </button>
  );
}

function Field({
  label,
  suffix,
  ...props
}: { label: string; suffix?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 focus-within:border-brand-400">
        <input
          {...props}
          className="w-full bg-transparent text-sm text-white outline-none"
        />
        {suffix && <span className="text-xs text-white/40">{suffix}</span>}
      </span>
    </label>
  );
}

function Choice({
  label,
  hint,
  name,
  options,
  defaultValue,
}: {
  label: string;
  /** À quoi sert la réponse : une question dont on ignore l'effet se répond mal. */
  hint?: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-white/80">{label}</legend>
      {hint && <p className="mt-0.5 text-xs leading-relaxed text-white/45">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              className="peer sr-only"
            />
            <span className="block rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition peer-checked:border-brand-400 peer-checked:bg-brand-400/10 peer-checked:text-brand-200 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
