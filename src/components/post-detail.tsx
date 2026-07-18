import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CopyLinkButton } from "@/components/copy-link-button";
import type { PublicBrandProfile, PublicFeedPost } from "@/lib/db";
import { appUrl } from "@/lib/brand";
import { safeHttpUrl, safeImageUrl } from "@/lib/safe-url";

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

export function PostDetail({
  post,
  brand,
}: {
  post: PublicFeedPost;
  brand: PublicBrandProfile | null;
}) {
  const when = formatWhen(post.publishedAt);
  const imageUrl = safeImageUrl(post.imageUrl);
  const websiteUrl = safeHttpUrl(brand?.websiteUrl ?? null);
  const shareUrl = `${appUrl()}/b/${post.brandSlug}/p/${post.id}`;
  const usernameHref = post.ownerUsername
    ? `/u/${encodeURIComponent(post.ownerUsername)}`
    : `/b/${post.brandSlug}`;

  return (
    <article className="overflow-hidden rounded-3xl border border-ink/8 bg-white/75 shadow-soft backdrop-blur-sm">
      {imageUrl ? (
        <div className="aspect-[4/3] w-full bg-mist sm:aspect-[16/10]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div className="flex min-h-[12rem] items-end bg-gradient-to-br from-mist via-accent-soft to-fog p-6 sm:p-8">
          <p className="font-display text-2xl italic leading-snug text-ink/70">
            {post.content}
          </p>
        </div>
      )}

      <div className="space-y-6 p-6 sm:p-8">
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
          <p className="whitespace-pre-wrap text-base leading-relaxed text-ink">
            {post.content}
          </p>
        ) : null}

        <div className="rounded-2xl border border-ink/8 bg-fog/60 px-4 py-4">
          <Link
            href={`/b/${post.brandSlug}`}
            className="font-medium text-ink underline-offset-4 hover:underline"
          >
            {post.brandName}
          </Link>
          {post.ownerUsername ? (
            <p className="mt-1">
              <Link
                href={usernameHref}
                className="relative z-10 text-sm font-medium text-accent underline-offset-2 hover:underline"
              >
                @{post.ownerUsername}
              </Link>
            </p>
          ) : null}
          {brand?.description ? (
            <p className="mt-2 text-sm leading-relaxed text-slate">
              {brand.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <CopyLinkButton url={shareUrl} label="Copy post link" />
          {websiteUrl ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-fog px-4 py-2 text-sm font-medium text-ink transition hover:border-ink/30"
            >
              <ExternalLink className="h-4 w-4" />
              Website
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
