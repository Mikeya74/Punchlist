import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Punch List",
    short_name: "Punch List",
    description: "Construction punch list app",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F5F2",
    theme_color: "#1C1917",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}