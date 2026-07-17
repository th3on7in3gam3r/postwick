import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  const base = appUrl();
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/b/", "/privacy", "/terms", "/report"],
      disallow: ["/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
