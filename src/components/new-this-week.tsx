import Link from "next/link";
import type { PublicFeedPost } from "@/lib/db";
import { safeImageUrl } from "@/lib/safe-url";

export function NewThisWeek({ posts }: { posts: PublicFeedPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl tracking-tight text-ink">
          New this week
        </h2>
        <p className="text-xs text-slate">Fresh public posts</p>
      </div>
      <div className="pill-scroll -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
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
              <div className="space-y-1 p-3">
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
    </section>
  );
}
