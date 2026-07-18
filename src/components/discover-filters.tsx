import Link from "next/link";
import { cn } from "@/lib/utils";

function hrefFor(opts: { niche?: string; city?: string; q?: string }) {
  const params = new URLSearchParams();
  if (opts.niche) params.set("niche", opts.niche);
  if (opts.city) params.set("city", opts.city);
  if (opts.q) params.set("q", opts.q);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

const pillBase =
  "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition";
const pillActive = "border-ink bg-ink text-fog";
const pillIdle =
  "border-ink/10 bg-white/70 text-slate hover:border-ink/25 hover:text-ink";

const pillRowClass =
  "pill-scroll flex flex-nowrap gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0";

export function DiscoverFilters({
  niches,
  cities,
  activeNiche,
  activeCity,
  activeQuery,
  resultTotal,
}: {
  niches: string[];
  cities: string[];
  activeNiche?: string;
  activeCity?: string;
  activeQuery?: string;
  resultTotal?: number;
}) {
  const filtersActive = Boolean(activeNiche || activeCity || activeQuery);
  const showPills = niches.length > 0 || cities.length > 0;

  return (
    <div className="space-y-4">
      <form
        method="get"
        action="/"
        className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
      >
        {activeNiche ? (
          <input type="hidden" name="niche" value={activeNiche} />
        ) : null}
        {activeCity ? (
          <input type="hidden" name="city" value={activeCity} />
        ) : null}
        <label className="sr-only" htmlFor="feed-search">
          Search posts
        </label>
        <input
          id="feed-search"
          name="q"
          type="search"
          defaultValue={activeQuery ?? ""}
          placeholder="Search posts or brands"
          className="w-full min-w-0 flex-1 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm text-ink outline-none transition placeholder:text-slate/70 focus:border-ink/30 sm:min-w-[12rem]"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-fog transition hover:bg-ink/90"
          >
            Search
          </button>
          {activeQuery ? (
            <Link
              href={hrefFor({ niche: activeNiche, city: activeCity })}
              className="inline-flex items-center rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-medium text-slate transition hover:border-ink/25 hover:text-ink"
            >
              Clear search
            </Link>
          ) : null}
        </div>
      </form>

      {showPills ? (
        <>
          {niches.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate">
                Niche
              </p>
              <div className={pillRowClass}>
                <Link
                  href={hrefFor({ city: activeCity, q: activeQuery })}
                  className={cn(
                    pillBase,
                    !activeNiche ? pillActive : pillIdle,
                  )}
                >
                  All
                </Link>
                {niches.map((niche) => (
                  <Link
                    key={niche}
                    href={hrefFor({
                      niche,
                      city: activeCity,
                      q: activeQuery,
                    })}
                    className={cn(
                      pillBase,
                      activeNiche === niche ? pillActive : pillIdle,
                    )}
                  >
                    {niche}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {cities.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate">
                City
              </p>
              <div className={pillRowClass}>
                <Link
                  href={hrefFor({ niche: activeNiche, q: activeQuery })}
                  className={cn(pillBase, !activeCity ? pillActive : pillIdle)}
                >
                  All
                </Link>
                {cities.map((city) => (
                  <Link
                    key={city}
                    href={hrefFor({
                      niche: activeNiche,
                      city,
                      q: activeQuery,
                    })}
                    className={cn(
                      pillBase,
                      activeCity === city ? pillActive : pillIdle,
                    )}
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {filtersActive && typeof resultTotal === "number" ? (
        <p className="text-sm text-slate">
          {resultTotal} {resultTotal === 1 ? "post" : "posts"}
        </p>
      ) : null}
    </div>
  );
}
