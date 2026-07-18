"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type FilterNavContextValue = {
  pending: boolean;
  navigate: (href: string) => void;
};

const FilterNavContext = createContext<FilterNavContextValue | null>(null);

export function FilterNavProvider({
  children,
  activeNiche,
  activeCity,
  activeQuery,
}: {
  children: ReactNode;
  activeNiche?: string;
  activeCity?: string;
  activeQuery?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPending(false);
  }, [activeNiche, activeCity, activeQuery]);

  const navigate = useCallback(
    (href: string) => {
      setPending(true);
      startTransition(() => {
        router.push(href);
      });
    },
    [router],
  );

  const value = useMemo(
    () => ({ pending, navigate }),
    [pending, navigate],
  );

  return (
    <FilterNavContext.Provider value={value}>
      {children}
    </FilterNavContext.Provider>
  );
}

export function useFilterNav() {
  const ctx = useContext(FilterNavContext);
  if (!ctx) {
    throw new Error("useFilterNav must be used within FilterNavProvider");
  }
  return ctx;
}

/** Soft-nav filter link that marks the feed pending. */
export function FilterNavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const { navigate } = useFilterNav();
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return;
        }
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

export function FeedPendingShell({ children }: { children: ReactNode }) {
  const { pending } = useFilterNav();
  return (
    <div className="relative" aria-busy={pending}>
      {pending ? (
        <div
          className="mb-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-hidden
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-ink/8 bg-white/60"
            />
          ))}
        </div>
      ) : null}
      <div
        className={
          pending
            ? "pointer-events-none opacity-50 transition-opacity duration-200"
            : "transition-opacity duration-200"
        }
      >
        {children}
      </div>
    </div>
  );
}
