import Link from "next/link";
import { cn } from "@/lib/utils";

function hrefFor(opts: { niche?: string; city?: string }) {
  const params = new URLSearchParams();
  if (opts.niche) params.set("niche", opts.niche);
  if (opts.city) params.set("city", opts.city);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function DiscoverFilters({
  niches,
  cities,
  activeNiche,
  activeCity,
}: {
  niches: string[];
  cities: string[];
  activeNiche?: string;
  activeCity?: string;
}) {
  if (niches.length === 0 && cities.length === 0) return null;

  return (
    <div className="space-y-4">
      {niches.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate">
            Niche
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={hrefFor({ city: activeCity })}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition",
                !activeNiche
                  ? "border-ink bg-ink text-fog"
                  : "border-ink/10 bg-white/70 text-slate hover:border-ink/25 hover:text-ink",
              )}
            >
              All
            </Link>
            {niches.map((niche) => (
              <Link
                key={niche}
                href={hrefFor({ niche, city: activeCity })}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition",
                  activeNiche === niche
                    ? "border-ink bg-ink text-fog"
                    : "border-ink/10 bg-white/70 text-slate hover:border-ink/25 hover:text-ink",
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
          <div className="flex flex-wrap gap-2">
            <Link
              href={hrefFor({ niche: activeNiche })}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition",
                !activeCity
                  ? "border-ink bg-ink text-fog"
                  : "border-ink/10 bg-white/70 text-slate hover:border-ink/25 hover:text-ink",
              )}
            >
              All
            </Link>
            {cities.map((city) => (
              <Link
                key={city}
                href={hrefFor({ niche: activeNiche, city })}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition",
                  activeCity === city
                    ? "border-ink bg-ink text-fog"
                    : "border-ink/10 bg-white/70 text-slate hover:border-ink/25 hover:text-ink",
                )}
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
