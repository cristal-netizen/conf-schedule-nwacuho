import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NWACUHO 2027 Conference Companion",
    short_name: "NWACUHO 2027",
    description: "Vancouver 2027 conference schedule, personalized agenda, community and networking.",
    start_url: "/2027",
    scope: "/",
    display: "standalone",
    background_color: "#1F443E",
    theme_color: "#1F443E",
    icons: [
      {
        src: "/branding/nwacuho-app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
