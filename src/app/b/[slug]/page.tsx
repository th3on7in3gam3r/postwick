import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { CopyLinkButton } from "@/components/copy-link-button";
import { FeedEmpty } from "@/components/post-card";
import { FeedGrid } from "@/components/feed-grid";
import { ViewBeacon } from "@/components/view-beacon";
import { appUrl, kerygmaUrl } from "@/lib/brand";
import {
  getPublicBrandBySlug,
  getPublicPostsByBrandSlug,
} from "@/lib/db";
import { safeHttpUrl } from "@/lib/safe-url";
import { sharePageMetadata, truncateForMeta } from "@/lib/seo";

type PageProps = {
  params: { slug: string };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const brand = await getPublicBrandBySlug(params.slug);
  if (!brand) {
    return { title: "Brand not found" };
  }

  const page = await getPublicPostsByBrandSlug(params.slug, { limit: 1 });
  const firstImage = page.posts[0]?.imageUrl ?? null;
  const description = truncateForMeta(
    brand.description ??
      `Public posts from ${brand.name} on Postwick.`,
  );

  return sharePageMetadata({
    title: brand.name,
    description,
    path: `/b/${params.slug}`,
    imageUrl: firstImage,
  });
}

export default async function BrandPage({ params }: PageProps) {
  const brand = await getPublicBrandBySlug(params.slug);
  if (!brand) notFound();

  const page = await getPublicPostsByBrandSlug(params.slug);
  const websiteUrl = safeHttpUrl(brand.websiteUrl);
  const shareUrl = `${appUrl()}/b/${brand.publicSlug}`;

  return (
    <div className="space-y-10">
      <ViewBeacon brandSlug={brand.publicSlug} path={`/b/${brand.publicSlug}`} />
      <section className="rounded-3xl border border-ink/8 bg-white/75 p-8 shadow-soft backdrop-blur-sm md:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {brand.publicNiche ? <span>{brand.publicNiche}</span> : null}
          {brand.publicNiche && brand.publicCity ? <span>·</span> : null}
          {brand.publicCity ? <span>{brand.publicCity}</span> : null}
        </div>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] tracking-tight text-ink">
          {brand.name}
        </h1>
        {brand.ownerUsername ? (
          <p className="mt-2">
            <Link
              href={`/u/${encodeURIComponent(brand.ownerUsername)}`}
              className="text-sm font-medium text-accent underline-offset-2 hover:underline"
            >
              @{brand.ownerUsername}
            </Link>
          </p>
        ) : null}
        {brand.description ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            {brand.description}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <CopyLinkButton url={shareUrl} />
          {websiteUrl ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-fog px-4 py-2 text-sm font-medium text-ink transition hover:border-ink/30"
            >
              <ExternalLink className="h-4 w-4" />
              Website
            </a>
          ) : null}
          <a
            href={kerygmaUrl()}
            className="inline-flex items-center rounded-full bg-ink px-4 py-2 text-sm font-medium text-fog transition hover:bg-ink/90"
          >
            Powered by Kerygma Social
          </a>
        </div>
        <p className="mt-6 text-sm text-slate">
          <Link href="/" className="hover:text-ink hover:underline">
            ← Back to home
          </Link>
        </p>
      </section>

      {page.posts.length === 0 ? (
        <FeedEmpty
          title="No shared posts yet"
          description="This brand is listed publicly, but has not shared any published posts on Postwick. Owners can share from Kerygma History after publishing."
        />
      ) : (
        <FeedGrid
          initialPosts={page.posts}
          initialHasMore={page.hasMore}
          initialNextOffset={page.nextOffset}
          initialTotal={page.total}
          source={{ kind: "brand", slug: brand.publicSlug }}
          showBrand={false}
        />
      )}
    </div>
  );
}
