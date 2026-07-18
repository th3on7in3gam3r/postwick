"use client";

import { useState } from "react";
import { PostCard } from "@/components/post-card";
import type { PublicFeedPost } from "@/lib/db";

type FeedSource =
  | {
      kind: "home";
      niche?: string | null;
      city?: string | null;
      q?: string | null;
    }
  | { kind: "brand"; slug: string };

export function FeedGrid({
  initialPosts,
  initialHasMore,
  initialNextOffset,
  initialTotal,
  source,
  showBrand = true,
}: {
  initialPosts: PublicFeedPost[];
  initialHasMore: boolean;
  initialNextOffset: number | null;
  initialTotal?: number;
  source: FeedSource;
  showBrand?: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextOffset, setNextOffset] = useState(initialNextOffset);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (!hasMore || nextOffset == null || loading) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: "48",
        offset: String(nextOffset),
      });
      if (source.kind === "home") {
        if (source.niche) params.set("niche", source.niche);
        if (source.city) params.set("city", source.city);
        if (source.q) params.set("q", source.q);
      } else {
        params.set("brand", source.slug);
      }

      const res = await fetch(`/api/feed?${params.toString()}`);
      if (!res.ok) throw new Error("Could not load more posts");
      const data = (await res.json()) as {
        posts: PublicFeedPost[];
        hasMore: boolean;
        nextOffset: number | null;
        total?: number;
      };

      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...data.posts.filter((p) => !seen.has(p.id))];
      });
      setHasMore(data.hasMore);
      setNextOffset(data.nextOffset);
    } catch {
      setError("Couldn’t load more. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const caughtUpCount = initialTotal ?? posts.length;

  return (
    <div className="feed-grid-enter space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} showBrand={showBrand} />
        ))}
      </div>
      {posts.length > 0 ? (
        <div className="flex flex-col items-center gap-2">
          {hasMore ? (
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-fog transition hover:bg-ink/90 disabled:opacity-60"
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          ) : (
            <p className="text-sm text-slate">
              You’re caught up · {caughtUpCount}{" "}
              {caughtUpCount === 1 ? "post" : "posts"}
            </p>
          )}
          {error ? <p className="text-sm text-slate">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
