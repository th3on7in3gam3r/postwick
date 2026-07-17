import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Postwick privacy policy.",
};

export default function PrivacyPage() {
  return (
    <article className="prose-sm max-w-2xl space-y-4 pt-6 text-slate md:pt-10">
      <h1 className="font-display text-3xl text-ink">Privacy</h1>
      <p>
        Postwick displays posts that brand owners explicitly share from Kerygma
        Social. We do not create consumer accounts on Postwick in v1.
      </p>
      <p>
        Public pages may show brand name, niche, website, description, and
        opt-in post content (caption, image, platform, publish time). We do not
        expose private tokens, unpublished drafts, or publish error details.
      </p>
      <p>
        Postwick and Kerygma Social may share infrastructure (including a
        database). For account and billing privacy related to creating posts,
        see Kerygma Social&apos;s privacy policy on that product&apos;s site.
      </p>
      <p>
        To request removal of a public post or brand page, use{" "}
        <Link href="/report" className="text-ink underline-offset-2 hover:underline">
          Report
        </Link>
        . Brand owners can also turn off sharing from Kerygma History. Contact
        channels on Kerygma Social apply for account and billing privacy.
      </p>
      <p className="pt-4">
        <Link href="/" className="text-ink underline-offset-2 hover:underline">
          ← Feed
        </Link>
      </p>
    </article>
  );
}
