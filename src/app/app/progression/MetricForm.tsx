"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { enregistrerMesure, type MetricState } from "./actions";

export function MetricForm() {
  const [state, formAction] = useActionState<MetricState, FormData>(
    enregistrerMesure,
    undefined,
  );

  return (
    <form action={formAction} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="font-extrabold text-white">Ajouter une mesure</h2>
      <p className="mt-1 text-sm text-white/55">
        Une fois par semaine suffit, toujours dans les mêmes conditions (le matin, à jeun).
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-white/80">Poids (kg)</span>
          <input
            name="weightKg"
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder="72,5"
            className="mt-1.5 w-full rounded-xl border border-white/15 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white/80">Tour de taille (cm)</span>
          <input
            name="waistCm"
            type="number"
            step="0.5"
            inputMode="decimal"
            placeholder="84"
            className="mt-1.5 w-full rounded-xl border border-white/15 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="text-sm font-semibold text-white/80">Note (facultatif)</span>
        <input
          name="note"
          type="text"
          maxLength={200}
          placeholder="Bonne semaine, 3 séances faites"
          className="mt-1.5 w-full rounded-xl border border-white/15 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </label>

      {state?.error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-300">
          {state.error}
        </p>
      )}
      {state?.ok && <p className="mt-3 text-sm font-medium text-brand-300">✓ Mesure enregistrée.</p>}

      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 rounded-full bg-ink-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-white/20 disabled:opacity-60"
    >
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}
