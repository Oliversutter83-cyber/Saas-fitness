"use client";

import { useState } from "react";

/**
 * Capture d'email depuis la page de vente. Sert d'aimant pour les visiteurs
 * venus d'Instagram ou TikTok qui ne sont pas prêts à payer tout de suite :
 * on garde le contact plutôt que de perdre le clic payant.
 */
export function LeadForm({ source = "landing" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Une erreur est survenue.");
      setState("done");
      setMessage("C'est noté ! Vous recevrez la séance offerte par email.");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  if (state === "done") {
    return (
      <p className="rounded-2xl bg-brand-400/15 px-5 py-4 text-sm font-semibold text-brand-200">
        ✓ {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.fr"
          aria-label="Votre adresse email"
          className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:border-brand-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-full bg-ember-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-ember-400 disabled:opacity-60"
        >
          {state === "loading" ? "Envoi…" : "Recevoir la séance"}
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-sm text-red-300">{message}</p>}
      <p className="mt-2 text-xs text-white/40">
        Un email, pas de spam, désinscription en un clic.
      </p>
    </form>
  );
}
