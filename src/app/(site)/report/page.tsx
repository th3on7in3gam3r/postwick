import type { Metadata } from "next";
import { Suspense } from "react";
import { ReportForm } from "@/components/report-form";

export const metadata: Metadata = {
  title: "Report",
  description: "Report a Postwick post or brand page for review.",
};

export default function ReportPage() {
  return (
    <article className="max-w-xl space-y-4 pt-6 md:pt-10">
      <h1 className="font-display text-3xl text-ink">Report content</h1>
      <p className="text-sm leading-relaxed text-slate">
        Postwick only shows posts brand owners opt in to share. Use this form if
        something should be reviewed or removed. We will follow up via email.
      </p>
      <Suspense fallback={<p className="text-sm text-slate">Loading form…</p>}>
        <ReportForm />
      </Suspense>
    </article>
  );
}
