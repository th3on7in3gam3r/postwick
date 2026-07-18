import type { Metadata } from "next";
import { FilterEmpty, FeedEmpty } from "@/components/post-card";
import { DiscoverFilters } from "@/components/discover-filters";
import { FeedGrid } from "@/components/feed-grid";
import { NewThisWeek } from "@/components/new-this-week";
import { kerygmaUrl } from "@/lib/brand";
import {
  getPublicCities,
  getPublicFeedPosts,
  getPublicNiches,
  getRecentPublicFeedPosts,
} from "@/lib/db";
import {
  sanitizeCity,
  sanitizeNiche,
  sanitizeSearchQuery,
} from "@/lib/env";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Browse opt-in published posts from local brands on Postwick.",
};

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { niche?: string; city?: string; q?: string };
}) {
  const niche = sanitizeNiche(searchParams.niche);
  const city = sanitizeCity(searchParams.city);
  const q = sanitizeSearchQuery(searchParams.q);
  const filtersActive = Boolean(niche || city || q);

  const [page, niches, cities, recent] = await Promise.all([
    getPublicFeedPosts({ niche, city, q }),
    getPublicNiches(),
    getPublicCities(),
    getRecentPublicFeedPosts({ days: 7, limit: 12, niche, city, q }),
  ]);

  return (
    <div className="space-y-10">
      <section className="max-w-2xl pt-4 md:pt-8">
        <p className="text-sm font-medium leading-snug text-accent md:text-base">
          Discover what brands are posting in your community
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,3.6rem)] leading-[1.05] tracking-tight text-ink">
          Postwick
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate md:text-lg">
          Browse posts brands choose to share. Create and publish on Kerygma;
          use Studio to set your username and edit captions after sharing.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href="/studio"
            className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-fog transition hover:bg-ink/90"
          >
            Open Studio
          </a>
          <a
            href={kerygmaUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full border border-ink/15 bg-transparent px-5 py-2.5 text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white/50"
          >
            Create on Kerygma
          </a>
        </div>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate/90">
          Workflow: create and publish on Kerygma → share to Postwick → manage
          captions and username in Studio.
        </p>
      </section>

      <DiscoverFilters
        niches={niches}
        cities={cities}
        activeNiche={niche}
        activeCity={city}
        activeQuery={q}
        resultTotal={filtersActive ? page.total : undefined}
      />

      <NewThisWeek posts={recent} />

      {page.posts.length === 0 ? (
        filtersActive ? (
          <FilterEmpty />
        ) : (
          <FeedEmpty />
        )
      ) : (
        <FeedGrid
          key={`${niche ?? ""}-${city ?? ""}-${q ?? ""}`}
          initialPosts={page.posts}
          initialHasMore={page.hasMore}
          initialNextOffset={page.nextOffset}
          initialTotal={page.total}
          source={{ kind: "home", niche, city, q }}
        />
      )}
    </div>
  );
}
