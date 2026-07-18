import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { ClerkMissingKeys } from "@/components/clerk-missing-keys";
import { safeAuthRedirectPath } from "@/lib/auth-redirect";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: true },
};

function isClerkConfigured() {
  return Boolean(
    process.env.CLERK_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim(),
  );
}

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  if (!isClerkConfigured()) {
    return <ClerkMissingKeys />;
  }

  const afterAuth = safeAuthRedirectPath(searchParams.redirect_url);

  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl={`/sign-in?redirect_url=${encodeURIComponent(afterAuth)}`}
      forceRedirectUrl={afterAuth}
      fallbackRedirectUrl={afterAuth}
    />
  );
}
