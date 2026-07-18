import type { Metadata } from "next";
import { appUrl } from "@/lib/brand";
import { safeImageUrl } from "@/lib/safe-url";

export function truncateForMeta(value: string, max = 160) {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function sharePageMetadata({
  title,
  description,
  path,
  imageUrl,
}: {
  title: string;
  description: string;
  path: string;
  imageUrl?: string | null;
}): Metadata {
  const url = `${appUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const image = safeImageUrl(imageUrl) ?? `${appUrl()}/icon.png`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "Postwick",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
