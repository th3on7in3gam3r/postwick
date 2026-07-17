import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "Postwick terms of use.",
};

export default function TermsPage() {
  return (
    <article className="prose-sm max-w-2xl space-y-4 pt-6 text-slate md:pt-10">
      <h1 className="font-display text-3xl text-ink">Terms</h1>
      <p>
        Postwick is a public discovery surface for opt-in brand posts published
        through Kerygma Social. Content is provided by brand owners; Postwick
        does not guarantee accuracy or availability.
      </p>
      <p>
        Do not scrape or republish feed content at scale without permission.
        Brand owners may revoke public sharing at any time; previously cached
        copies may persist briefly.
      </p>
      <p>
        Postwick is provided as-is without warranties. Kerygma Social remains
        the product for creating, approving, and publishing social content.
      </p>
      <p>
        To report abuse or request removal, use{" "}
        <Link href="/report" className="text-ink underline-offset-2 hover:underline">
          Report
        </Link>
        . Owners may revoke Postwick sharing at any time from Kerygma History.
      </p>
      <p className="pt-4">
        <Link href="/" className="text-ink underline-offset-2 hover:underline">
          ← Feed
        </Link>
      </p>
    </article>
  );
}
