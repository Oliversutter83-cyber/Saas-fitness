import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default async function ConnexionPage() {
  if (await getCurrentUser()) redirect("/app");

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Content de vous revoir</h1>
      <p className="mt-2 text-sm text-white/55">Connectez-vous pour reprendre votre programme.</p>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-white/55">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-bold text-brand-300 hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
