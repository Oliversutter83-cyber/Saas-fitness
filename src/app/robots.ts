import type { MetadataRoute } from "next";
import { SITE } from "@/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // L'espace membre et le tunnel de connexion n'ont rien à faire dans un
      // index de moteur de recherche.
      disallow: ["/app/", "/seance/", "/connexion", "/inscription", "/api/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
