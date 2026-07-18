import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ClaimCodeForm } from "@/components/studio/claim-code-form";
import { StudioDashboard } from "@/components/studio/studio-dashboard";
import {
  getPostwickAccountByClerkId,
  getStudioBrands,
  getStudioPosts,
} from "@/lib/db";
import { kerygmaUrl } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

function isClerkConfigured() {
  return Boolean(
    process.env.CLERK_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim(),
  );
}

export default async function StudioPage() {
  if (!isClerkConfigured()) {
    redirect("/sign-in");
  }

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/studio");
  }

  const account = await getPostwickAccountByClerkId(userId);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Owner studio
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-ink md:text-4xl">
          Studio
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate">
          Link your Kerygma brand with a claim code, set a display username, and
          edit captions for posts shared on Postwick.
        </p>
      </header>

      {!account ? (
        <ClaimCodeForm kerygmaUrl={kerygmaUrl()} />
      ) : (
        <StudioDashboard
          account={account}
          brands={await getStudioBrands(account)}
          posts={await getStudioPosts(account)}
        />
      )}
    </div>
  );
}
