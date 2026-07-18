import type { Metadata } from "next";
import Link from "next/link";
import { FeedEmpty } from "@/components/post-card";
import { DiscoverFilters } from "@/components/discover-filters";
import { FeedGrid } from "@/components/feed-grid";
import { kerygmaUrl } from "@/lib/brand";
import {
  getPublicCities,
  getPublicFeedPosts,
  getPublicNiches,
} from "@/lib/db";
import { sanitizeCity, sanitizeNiche } from "@/lib/env";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Browse opt-in published posts from local brands on Postwick.",
};

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { niche?: string; city?: string };
}) {
  const niche = sanitizeNiche(searchParams.niche);
  const city = sanitizeCity(searchParams.city);
  const [page, niches, cities] = await Promise.all([
    getPublicFeedPosts({ niche, city }),
    getPublicNiches(),
    getPublicCities(),
  ]);

  return (
    <div className="space-y-10">
      <section className="max-w-2xl pt-4 md:pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Public network
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,3.6rem)] leading-[1.05] tracking-tight text-ink">
          Postwick
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate md:text-lg">
          A public feed of posts brands choose to share. Browse by niche or city
          — owners manage captions and usernames in Studio.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/studio"
            className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-fog transition hover:bg-ink/90"
          >
            Owner Studio
          </Link>
          <a
            href={kerygmaUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate underline-offset-4 transition hover:text-ink hover:underline"
          >
            Create posts on Kerygma
          </a>
        </div>
      </section>

      <DiscoverFilters
        niches={niches}
        cities={cities}
        activeNiche={niche}
        activeCity={city}
      />

      {page.posts.length === 0 ? (
        <FeedEmpty />
      ) : (
        <FeedGrid
          key={`${niche ?? ""}-${city ?? ""}`}
          initialPosts={page.posts}
          initialHasMore={page.hasMore}
          initialNextOffset={page.nextOffset}
          source={{ kind: "home", niche, city }}
        />
      )}
    </div>
  );
}
