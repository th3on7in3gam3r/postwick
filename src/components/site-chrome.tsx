import Link from "next/link";
import { AuthNav } from "@/components/auth-nav";
import { kerygmaUrl } from "@/lib/brand";

function isClerkConfigured() {
  return Boolean(
    process.env.CLERK_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim(),
  );
}

const navLinkClass =
  "rounded-lg px-2.5 py-1.5 font-medium text-slate transition hover:bg-ink/[0.04] hover:text-ink";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-5 py-5 md:px-8 md:py-6">
      {/* Hard nav: Clerk catch-all sign-in routes can trap Next.js <Link> soft nav to /. */}
      <a
        href="/"
        className="group flex shrink-0 items-center gap-2.5"
        aria-label="Postwick home"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-[0.55rem]"
        />
        <span className="font-display text-[1.35rem] tracking-tight text-ink md:text-2xl">
          Postwick
        </span>
      </a>

      <nav
        className="flex min-w-0 items-center gap-1 text-sm sm:gap-2"
        aria-label="Primary"
      >
        <div className="flex items-center gap-0.5 sm:gap-1">
          <a href="/" className={navLinkClass}>
            Feed
          </a>
          <Link href="/studio" className={navLinkClass}>
            Studio
          </Link>
          <a
            href={kerygmaUrl()}
            className={`hidden md:inline ${navLinkClass}`}
          >
            Create
          </a>
        </div>

        {isClerkConfigured() ? (
          <>
            <span
              className="mx-1.5 hidden h-4 w-px bg-ink/10 sm:block"
              aria-hidden
            />
            <AuthNav />
          </>
        ) : null}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-16 flex w-full max-w-5xl flex-col gap-3 border-t border-ink/10 px-5 py-8 text-sm text-slate md:flex-row md:items-center md:justify-between md:px-8">
      <p>
        Postwick — public posts from brands on{" "}
        <a href={kerygmaUrl()} className="text-ink underline-offset-2 hover:underline">
          Kerygma Social
        </a>
        .
      </p>
      <div className="flex flex-wrap gap-4">
        <a
          href={kerygmaUrl()}
          className="hover:text-ink"
          target="_blank"
          rel="noopener noreferrer"
        >
          Create with Kerygma
        </a>
        <Link href="/report" className="hover:text-ink">
          Report
        </Link>
        <Link href="/privacy" className="hover:text-ink">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-ink">
          Terms
        </Link>
      </div>
    </footer>
  );
}
