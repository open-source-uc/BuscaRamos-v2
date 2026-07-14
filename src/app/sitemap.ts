import type { MetadataRoute } from "next";
import sigles from "./sitemap-sigles.json";
import { BASE_URL, ROUTES } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/${ROUTES.SCHEDULE}`,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}${ROUTES.REVIEWS}`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...sigles.map((sigle) => ({
      url: `${BASE_URL}/${sigle}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
