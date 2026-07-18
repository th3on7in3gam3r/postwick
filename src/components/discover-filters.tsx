"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
  "shrink-0 rounded-full border px-3 py-1 text-sm transition";
const pillActive = "border-ink bg-ink text-fog";
const pillIdle =
  "border-ink/10 bg-white/70 text-slate hover:border-ink/25 hover:text-ink";

const pillRowClass =
  "pill-scroll flex min-w-0 flex-1 flex-nowrap gap-1.5 overflow-x-auto pb-0.5 md:flex-wrap md:overflow-visible md:pb-0";

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <p className="w-12 shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate sm:w-14">
        {label}
      </p>
      <div className={pillRowClass}>{children}</div>
    </div>
  );
}

/** Hide while scrolling down; show on scroll up or when scrolling stops. */
function useAutoHideOnScroll() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    lastY.current = window.scrollY;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      setVisible(true);
      return;
    }

    function clearIdle() {
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
    }

    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY.current;

      // Near top of page — always show filters
      if (y < 48) {
        setVisible(true);
        lastY.current = y;
        clearIdle();
        return;
      }

      if (Math.abs(delta) < 6) return;

      if (delta > 0) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastY.current = y;

      clearIdle();
      idleTimer.current = setTimeout(() => {
        setVisible(true);
      }, 280);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearIdle();
    };
  }, []);

  return visible;
}

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
  const barVisible = useAutoHideOnScroll();

  return (
    <div
      className={cn(
        "sticky top-16 z-30 -mx-5 border-b border-ink/8 bg-white/85 px-5 py-3 backdrop-blur-md transition-transform duration-200 ease-out md:-mx-8 md:px-8",
        barVisible
          ? "translate-y-0"
          : "pointer-events-none -translate-y-[calc(100%+0.25rem)]",
      )}
    >
      <div className="space-y-2.5">
        <DiscoverSearchForm
          activeNiche={activeNiche}
          activeCity={activeCity}
          activeQuery={activeQuery}
        />

        {showPills ? (
          <div className="space-y-2">
            {niches.length > 0 ? (
              <FilterRow label="Niche">
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
              </FilterRow>
            ) : null}

            {cities.length > 0 ? (
              <FilterRow label="City">
                <FilterNavLink
                  href={hrefFor({ niche: activeNiche, q: activeQuery })}
                  className={cn(
                    pillBase,
                    !activeCity ? pillActive : pillIdle,
                  )}
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
              </FilterRow>
            ) : null}
          </div>
        ) : null}

        {filtersActive && typeof resultTotal === "number" ? (
          <p className="text-sm text-slate">
            {resultTotal} {resultTotal === 1 ? "post" : "posts"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
