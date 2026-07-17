import Link from "next/link";
import { kerygmaUrl } from "@/lib/brand";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 md:px-8">
      <Link href="/" className="group flex items-baseline gap-2">
        <span className="font-display text-2xl tracking-tight text-ink md:text-[1.75rem]">
          Postwick
        </span>
        <span className="hidden text-xs font-medium uppercase tracking-[0.16em] text-slate sm:inline">
          Local posts
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm text-slate">
        <Link href="/" className="transition hover:text-ink">
          Feed
        </Link>
        <a
          href={kerygmaUrl()}
          className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-fog transition hover:bg-ink/90"
        >
          Create with Kerygma
        </a>
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
      <div className="flex gap-4">
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
