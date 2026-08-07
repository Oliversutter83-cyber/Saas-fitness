import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";
import { getCurrentUser } from "@/lib/auth";
import { TRIAL_DAYS } from "@/config";

export const metadata: Metadata = {
  title: "Créer mon compte",
  robots: { index: false, follow: false },
};

export default async function InscriptionPage() {
  if (await getCurrentUser()) redirect("/app");

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Créer mon compte</h1>
      <p className="mt-2 text-sm text-white/55">
        {TRIAL_DAYS} jours d&apos;essai, aucun prélèvement avant la fin de l&apos;essai.
      </p>

      <SignupForm />

      <p className="mt-6 text-center text-sm text-white/55">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-bold text-brand-300 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
