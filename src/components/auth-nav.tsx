"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export function AuthNav() {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <SignedOut>
        <SignInButton mode="redirect">
          <button
            type="button"
            className="rounded-lg px-2.5 py-1.5 font-medium text-slate transition hover:bg-ink/[0.04] hover:text-ink"
          >
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="redirect">
          <button
            type="button"
            className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold tracking-wide text-fog transition hover:bg-ink/90"
          >
            Sign up
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </SignedIn>
    </div>
  );
}
