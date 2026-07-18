import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyLinkButton } from "@/components/copy-link-button";
import { PostDetail } from "@/components/post-detail";
import { ViewBeacon } from "@/components/view-beacon";
import { appUrl } from "@/lib/brand";
import {
  getPublicBrandBySlug,
  getPublicPostByBrandSlugAndId,
} from "@/lib/db";
import { sharePageMetadata, truncateForMeta } from "@/lib/seo";

type PageProps = {
  params: { slug: string; postId: string };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const post = await getPublicPostByBrandSlugAndId(params.slug, params.postId);
  if (!post) {
    return { title: "Post not found" };
  }

  return sharePageMetadata({
    title: `${post.brandName} on Postwick`,
    description: truncateForMeta(post.content),
    path: `/b/${post.brandSlug}/p/${post.id}`,
    imageUrl: post.imageUrl,
  });
}

export default async function BrandPostPage({ params }: PageProps) {
  const post = await getPublicPostByBrandSlugAndId(params.slug, params.postId);
  if (!post) notFound();

  const brand = await getPublicBrandBySlug(post.brandSlug);
  const shareUrl = `${appUrl()}/b/${post.brandSlug}/p/${post.id}`;

  return (
    <div className="mx-auto max-w-xl space-y-8 pt-4 md:pt-8">
      <ViewBeacon
        brandSlug={post.brandSlug}
        postId={post.id}
        path={`/b/${post.brandSlug}/p/${post.id}`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate">
          <Link
            href={`/b/${post.brandSlug}`}
            className="hover:text-ink hover:underline"
          >
            ← {post.brandName}
          </Link>
          <span className="mx-2 text-ink/20">·</span>
          <Link href="/" className="hover:text-ink hover:underline">
            Home
          </Link>
        </p>
        <CopyLinkButton url={shareUrl} label="Copy post link" />
      </div>
      <PostDetail post={post} brand={brand} />
    </div>
  );
}
