"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { inscrire, type FormState } from "../actions";

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

export function SignupForm() {
  const [state, formAction] = useActionState<FormState, FormData>(inscrire, undefined);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <Field label="Prénom" name="firstName" type="text" autoComplete="given-name" required />
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="8 caractères minimum"
      />

      <Choice label="Votre objectif" name="goal" options={GOALS} defaultValue="forme" />
      <Choice label="Votre niveau" name="level" options={LEVELS} defaultValue="debutant" />

      {state?.error && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
          {state.error}
        </p>
      )}

      <Submit />

      <p className="text-center text-xs leading-relaxed text-white/55">
        En créant un compte, vous acceptez les{" "}
        <Link href="/cgv" className="underline">
          CGV
        </Link>{" "}
        et la{" "}
        <Link href="/confidentialite" className="underline">
          politique de confidentialité
        </Link>
        .
      </p>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-ember-500 px-6 py-3.5 font-bold text-white transition hover:bg-ember-400 disabled:opacity-60"
    >
      {pending ? "Création…" : "Créer mon compte"}
    </button>
  );
}

function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-xl border border-white/15 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
      />
      {hint && <span className="mt-1 block text-xs text-white/55">{hint}</span>}
    </label>
  );
}

function Choice({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-white/80">{label}</legend>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              className="peer sr-only"
            />
            <span className="block rounded-full border border-white/15 px-3.5 py-2 text-sm font-medium text-white/70 transition peer-checked:border-brand-500 peer-checked:bg-white/5 peer-checked:text-brand-200 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
