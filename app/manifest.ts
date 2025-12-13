import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NWACUHO Conference Schedule",
    short_name: "NWACUHO",
    description: "NWACUHO Annual Conference schedule and personal agenda.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#28903b",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
