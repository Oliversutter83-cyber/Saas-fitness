import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 passe par un adaptateur de driver. Ici SQLite, qui suffit largement
 * pour démarrer et pour le développement local.
 *
 * Pour passer en production sur PostgreSQL (recommandé dès les premiers
 * abonnés payants) :
 *   1. npm i @prisma/adapter-pg pg
 *   2. provider = "postgresql" dans prisma/schema.prisma
 *   3. remplacer l'adaptateur ci-dessous par PrismaPg
 *   4. npx prisma migrate deploy
 */
function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url }),
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
