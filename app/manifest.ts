import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Amit Kumar | Agentic Architect",
    short_name: "Amit Kumar",
    description:
      "Mission Control for AI Agents. Engineering production-grade agentic architectures.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/profile.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
