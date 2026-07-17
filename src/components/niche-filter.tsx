import Link from "next/link";
import { cn } from "@/lib/utils";

export function NicheFilter({
  niches,
  active,
}: {
  niches: string[];
  active?: string;
}) {
  if (niches.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        className={cn(
          "rounded-full border px-3.5 py-1.5 text-sm transition",
          !active
            ? "border-ink bg-ink text-fog"
            : "border-ink/10 bg-white/70 text-slate hover:border-ink/25 hover:text-ink",
        )}
      >
        All
      </Link>
      {niches.map((niche) => (
        <Link
          key={niche}
          href={`/?niche=${encodeURIComponent(niche)}`}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm transition",
            active === niche
              ? "border-ink bg-ink text-fog"
              : "border-ink/10 bg-white/70 text-slate hover:border-ink/25 hover:text-ink",
          )}
        >
          {niche}
        </Link>
      ))}
    </div>
  );
}
