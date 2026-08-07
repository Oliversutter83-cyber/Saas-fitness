import type { MetadataRoute } from "next";
import { SITE } from "@/config";
import { EXERCISES } from "@/content/exercises";

/**
 * Les fiches d'exercices sont les pages qui peuvent capter du trafic gratuit
 * sur des recherches du type « comment faire des pompes correctement » : elles
 * ont toute leur place dans le plan du site.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { path: "", priority: 1 },
    { path: "/exercices", priority: 0.9 },
    { path: "/seance-decouverte", priority: 0.9 },
    { path: "/inscription", priority: 0.6 },
    { path: "/mentions-legales", priority: 0.2 },
    { path: "/cgv", priority: 0.2 },
    { path: "/confidentialite", priority: 0.2 },
  ];

  return [
    ...staticPages.map((page) => ({
      url: `${SITE.url}${page.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: page.priority,
    })),
    ...EXERCISES.map((exercise) => ({
      url: `${SITE.url}/exercices/${exercise.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
