import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Connexion à la base PostgreSQL.
 *
 * Le projet a démarré sur SQLite, pratique en développement mais inutilisable
 * en production : SQLite écrit dans un fichier, or l'hébergeur monte le disque
 * en lecture seule. Toute écriture — ne serait-ce que créer un compte —
 * échouait donc en ligne. PostgreSQL est un serveur distinct, ce problème
 * disparaît.
 */
function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL manquant. Créez une base PostgreSQL (Vercel → Storage, Neon, Supabase…) " +
        "et renseignez son URL de connexion dans les variables d'environnement.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// En développement, Next.js recharge les modules à chaque modification.
// On garde une seule instance sur globalThis pour ne pas ouvrir 50 connexions.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
