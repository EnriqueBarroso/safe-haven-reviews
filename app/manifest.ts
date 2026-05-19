import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YaFui — Reseñas de la comunidad",
    short_name: "YaFui",
    description: "Foro de reseñas y preguntas. Ya fui, ya lo viví, y te lo cuento.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#00ff87",
    orientation: "portrait",
    categories: ["social", "lifestyle"],
    icons: [
      {
        src: "/pwa-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
