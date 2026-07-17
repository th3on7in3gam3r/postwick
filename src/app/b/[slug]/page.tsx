import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { FeedEmpty, PostCard } from "@/components/post-card";
import { appUrl, kerygmaUrl } from "@/lib/brand";
import {
  getPublicBrandBySlug,
  getPublicPostsByBrandSlug,
} from "@/lib/db";
import { safeHttpUrl } from "@/lib/safe-url";

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

  return {
    title: brand.name,
    description:
      brand.description ??
      `Public posts from ${brand.name} on Postwick.`,
    alternates: { canonical: `${appUrl()}/b/${params.slug}` },
  };
}

export default async function BrandPage({ params }: PageProps) {
  const brand = await getPublicBrandBySlug(params.slug);
  if (!brand) notFound();

  const posts = await getPublicPostsByBrandSlug(params.slug);
  const websiteUrl = safeHttpUrl(brand.websiteUrl);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-ink/8 bg-white/75 p-8 shadow-soft md:p-10">
        {brand.publicNiche ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {brand.publicNiche}
          </p>
        ) : null}
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] tracking-tight text-ink">
          {brand.name}
        </h1>
        {brand.description ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            {brand.description}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
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
            ← Back to feed
          </Link>
        </p>
      </section>

      {posts.length === 0 ? (
        <FeedEmpty
          title="No shared posts yet"
          description="This brand is listed publicly, but has not shared any published posts on Postwick. Owners can share from Kerygma History after publishing."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} showBrand={false} />
          ))}
        </div>
      )}
    </div>
  );
}
