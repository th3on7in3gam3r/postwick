import Link from "next/link";

export function ClerkMissingKeys() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-ink/10 bg-white/80 px-6 py-10 text-center shadow-soft">
      <h1 className="font-display text-2xl text-ink">Auth not configured</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate">
        Add a Postwick Clerk application and set{" "}
        <code className="text-ink">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{" "}
        <code className="text-ink">CLERK_SECRET_KEY</code> to enable Studio sign-in.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-fog"
      >
        Back to feed
      </Link>
    </div>
  );
}
