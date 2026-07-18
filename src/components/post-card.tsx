import Link from "next/link";
import { CopyLinkButton } from "@/components/copy-link-button";
import type { PublicFeedPost } from "@/lib/db";
import { appUrl, kerygmaUrl } from "@/lib/brand";
import { safeImageUrl } from "@/lib/safe-url";

function formatWhen(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PostCard({
  post,
  showBrand = true,
}: {
  post: PublicFeedPost;
  showBrand?: boolean;
}) {
  const when = formatWhen(post.publishedAt);
  const imageUrl = safeImageUrl(post.imageUrl);
  const postPath = `/b/${post.brandSlug}/p/${post.id}`;
  const postUrl = `${appUrl()}${postPath}`;
  const reportHref = `/report?url=${encodeURIComponent(postUrl)}&slug=${encodeURIComponent(post.brandSlug)}`;

  return (
    <article
      id={`post-${post.id}`}
      className="overflow-hidden rounded-2xl border border-ink/8 bg-white/80 shadow-soft backdrop-blur-sm"
    >
      <Link href={postPath} className="block">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="aspect-[4/3] w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex aspect-[4/3] items-end bg-gradient-to-br from-mist via-accent-soft to-fog p-5">
            <p className="font-display text-xl italic text-ink/70 line-clamp-3">
              {post.content}
            </p>
          </div>
        )}
      </Link>
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-accent-soft px-2.5 py-1 font-medium uppercase tracking-wide text-accent">
            {post.platform}
          </span>
          {post.brandNiche ? (
            <span className="text-slate">{post.brandNiche}</span>
          ) : null}
          {post.brandCity ? (
            <span className="text-slate">{post.brandCity}</span>
          ) : null}
          {when ? <span className="text-slate/80">{when}</span> : null}
        </div>
        {imageUrl ? (
          <p className="text-sm leading-relaxed text-ink/90 line-clamp-4">
            {post.content}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {showBrand ? (
            <Link
              href={`/b/${post.brandSlug}`}
              className="inline-flex flex-col text-sm font-medium text-ink underline-offset-4 hover:underline"
            >
              <span>{post.brandName}</span>
              {post.ownerUsername ? (
                <span className="text-xs font-normal text-slate">
                  @{post.ownerUsername}
                </span>
              ) : null}
            </Link>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <CopyLinkButton url={postUrl} label="Copy link" variant="text" />
            <Link
              href={reportHref}
              className="text-xs text-slate underline-offset-2 hover:text-ink hover:underline"
            >
              Report
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
export function FeedEmpty({
  title = "No public posts yet",
  description = "When brands publish on Kerygma and share to Postwick, their posts appear here.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/15 bg-white/50 px-6 py-16 text-center">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          href={kerygmaUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-fog transition hover:bg-ink/90"
        >
          Start on Kerygma
        </a>
        <Link
          href="/studio"
          className="text-sm font-medium text-slate underline-offset-4 hover:text-ink hover:underline"
        >
          Already sharing? Open Studio
        </Link>
      </div>
    </div>
  );
}
