import type { MetadataRoute } from "next";
import sigles from "./sitemap-sigles.json";

const BASE_URL = "https://buscaramos.osuc.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    ...sigles.map((sigle) => ({
      url: `${BASE_URL}/${sigle}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
