import type { MetadataRoute } from "next";
import { SITE } from "@/config";

/**
 * Rend le site installable sur l'écran d'accueil, sans passer par l'App Store
 * ni le Play Store : l'abonné venu d'Instagram ou TikTok garde une icône comme
 * pour une application, et on ne paie aucune commission de store.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0908",
    theme_color: "#0a0908",
    lang: "fr",
    categories: ["health", "fitness", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-512.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
