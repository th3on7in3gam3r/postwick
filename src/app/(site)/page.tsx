import type { Metadata } from "next";
import { FilterEmpty, FeedEmpty } from "@/components/post-card";
import { DiscoverFilters } from "@/components/discover-filters";
import { FeedGrid } from "@/components/feed-grid";
import {
  FeedPendingShell,
  FilterNavProvider,
} from "@/components/filter-nav";
import { NewThisWeek } from "@/components/new-this-week";
import { WorkflowSteps } from "@/components/workflow-steps";
import { kerygmaUrl } from "@/lib/brand";
import {
  getPublicCities,
  getPublicFeedPosts,
  getPublicNiches,
  getRecentPublicFeedPosts,
} from "@/lib/db";
import {
  resolveActiveFilter,
  sanitizeSearchQuery,
} from "@/lib/env";
import { sharePageMetadata } from "@/lib/seo";

export const metadata: Metadata = sharePageMetadata({
  title: "Home",
  description:
    "Browse opt-in published posts from local brands on Postwick.",
  path: "/",
});

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { niche?: string; city?: string; q?: string };
}) {
  const q = sanitizeSearchQuery(searchParams.q);

  const [niches, cities] = await Promise.all([
    getPublicNiches(),
    getPublicCities(),
  ]);

  const niche = resolveActiveFilter(searchParams.niche, niches);
  const city = resolveActiveFilter(searchParams.city, cities);
  const filtersActive = Boolean(niche || city || q);

  const [page, recent] = await Promise.all([
    getPublicFeedPosts({ niche, city, q }),
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
        <WorkflowSteps />
      </section>

      <FilterNavProvider
        activeNiche={niche}
        activeCity={city}
        activeQuery={q}
      >
        <div className="space-y-10">
          <DiscoverFilters
            niches={niches}
            cities={cities}
            activeNiche={niche}
            activeCity={city}
            activeQuery={q}
            resultTotal={filtersActive ? page.total : undefined}
          />

          <NewThisWeek posts={recent} />

          <FeedPendingShell>
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
          </FeedPendingShell>
        </div>
      </FilterNavProvider>
    </div>
  );
}
