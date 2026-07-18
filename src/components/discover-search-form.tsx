"use client";

import Link from "next/link";
import { useFilterNav } from "@/components/filter-nav";

function hrefFor(opts: { niche?: string; city?: string; q?: string }) {
  const params = new URLSearchParams();
  if (opts.niche) params.set("niche", opts.niche);
  if (opts.city) params.set("city", opts.city);
  if (opts.q) params.set("q", opts.q);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function DiscoverSearchForm({
  activeNiche,
  activeCity,
  activeQuery,
}: {
  activeNiche?: string;
  activeCity?: string;
  activeQuery?: string;
}) {
  const { navigate } = useFilterNav();

  function submit(qRaw: string) {
    const q = qRaw.trim();
    navigate(
      hrefFor({
        niche: activeNiche,
        city: activeCity,
        q: q || undefined,
      }),
    );
  }

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        submit(String(fd.get("q") ?? ""));
      }}
    >
      <label className="sr-only" htmlFor="feed-search">
        Search posts
      </label>
      <input
        id="feed-search"
        name="q"
        type="search"
        defaultValue={activeQuery ?? ""}
        placeholder="Search posts or brands"
        enterKeyHint="search"
        className="w-full min-w-0 flex-1 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm text-ink outline-none transition placeholder:text-slate/70 focus:border-ink/30 sm:min-w-[12rem] sm:max-w-md"
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          submit((e.currentTarget as HTMLInputElement).value);
        }}
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
            onClick={(e) => {
              if (
                e.defaultPrevented ||
                e.button !== 0 ||
                e.metaKey ||
                e.ctrlKey ||
                e.shiftKey ||
                e.altKey
              ) {
                return;
              }
              e.preventDefault();
              navigate(hrefFor({ niche: activeNiche, city: activeCity }));
            }}
          >
            Clear search
          </Link>
        ) : null}
      </div>
    </form>
  );
}
