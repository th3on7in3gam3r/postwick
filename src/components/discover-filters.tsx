"use client";

import { DiscoverSearchForm } from "@/components/discover-search-form";
import { FilterNavLink } from "@/components/filter-nav";
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
  sticky = false,
}: {
  niches: string[];
  cities: string[];
  activeNiche?: string;
  activeCity?: string;
  activeQuery?: string;
  resultTotal?: number;
  sticky?: boolean;
}) {
  const filtersActive = Boolean(activeNiche || activeCity || activeQuery);
  const showPills = niches.length > 0 || cities.length > 0;

  return (
    <div
      className={cn(
        "space-y-4",
        sticky &&
          "sticky top-16 z-30 -mx-5 border-b border-ink/8 bg-white/80 px-5 py-4 backdrop-blur-md md:-mx-8 md:px-8",
      )}
    >
      <DiscoverSearchForm
        activeNiche={activeNiche}
        activeCity={activeCity}
        activeQuery={activeQuery}
      />

      {showPills ? (
        <>
          {niches.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate">
                Niche
              </p>
              <div className={pillRowClass}>
                <FilterNavLink
                  href={hrefFor({ city: activeCity, q: activeQuery })}
                  className={cn(
                    pillBase,
                    !activeNiche ? pillActive : pillIdle,
                  )}
                >
                  All
                </FilterNavLink>
                {niches.map((niche) => (
                  <FilterNavLink
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
                  </FilterNavLink>
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
                <FilterNavLink
                  href={hrefFor({ niche: activeNiche, q: activeQuery })}
                  className={cn(pillBase, !activeCity ? pillActive : pillIdle)}
                >
                  All
                </FilterNavLink>
                {cities.map((city) => (
                  <FilterNavLink
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
                  </FilterNavLink>
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
