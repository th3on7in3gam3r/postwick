"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { PublicFeedPost } from "@/lib/db";
import { safeImageUrl } from "@/lib/safe-url";

function formatWhen(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function NewThisWeekScroller({ posts }: { posts: PublicFeedPost[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(max > 4 && el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [posts, updateScrollState]);

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: dir * 240,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  return (
    <div className="relative">
      {canLeft ? (
        <button
          type="button"
          aria-label="Scroll new posts left"
          onClick={() => scrollByDir(-1)}
          className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink/10 bg-white/90 text-ink shadow-soft transition hover:border-ink/25"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
      {canRight ? (
        <button
          type="button"
          aria-label="Scroll new posts right"
          onClick={() => scrollByDir(1)}
          className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink/10 bg-white/90 text-ink shadow-soft transition hover:border-ink/25"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      ) : null}

      <div
        ref={scrollerRef}
        className="pill-scroll -mx-1 flex gap-3 overflow-x-auto px-1 pb-2"
      >
        {posts.map((post) => {
          const imageUrl = safeImageUrl(post.imageUrl);
          const href = `/b/${post.brandSlug}/p/${post.id}`;
          return (
            <Link
              key={post.id}
              href={href}
              className="group w-56 shrink-0 overflow-hidden rounded-2xl border border-ink/8 bg-white/75 shadow-soft backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {imageUrl ? (
                <div className="aspect-[4/3] w-full bg-mist">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-end bg-gradient-to-br from-mist via-accent-soft to-fog p-3">
                  <p className="font-display text-sm italic text-ink/70 line-clamp-3">
                    {post.content}
                  </p>
                </div>
              )}
              <div className="space-y-1.5 p-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 font-medium uppercase tracking-wide text-accent">
                    {post.platform}
                  </span>
                  {formatWhen(post.publishedAt) ? (
                    <span className="text-slate/80">
                      {formatWhen(post.publishedAt)}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs font-medium text-ink">{post.brandName}</p>
                {imageUrl ? (
                  <p className="text-xs leading-relaxed text-slate line-clamp-2">
                    {post.content}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>

      {canRight ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#e8eef6]/95 to-transparent"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

export function NewThisWeek({ posts }: { posts: PublicFeedPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl tracking-tight text-ink">
          New this week
        </h2>
        <p className="text-xs text-slate">Updated today</p>
      </div>
      <NewThisWeekScroller posts={posts} />
    </section>
  );
}
