import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { signInRedirectUrl } from "@/lib/auth-redirect";
import { pruneRateLimitBuckets, rateLimitOk } from "@/lib/rate-limit";

const isPublicRoute = createRouteMatcher([
  "/",
  "/b/(.*)",
  "/u/(.*)",
  "/privacy",
  "/terms",
  "/report",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/feed",
  "/api/health",
  "/api/analytics/view",
  "/robots.txt",
  "/sitemap.xml",
]);

function isClerkConfigured() {
  return Boolean(
    process.env.CLERK_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim(),
  );
}

function redirectToAppSignIn(req: NextRequest) {
  return NextResponse.redirect(
    signInRedirectUrl(
      req.url,
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
    ),
  );
}

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    pruneRateLimitBuckets();
    const result = rateLimitOk(req);
    if (!result.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000)),
            ),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }
  }

  // Always send unauthenticated users to the app /sign-in shell (gradient + nav),
  // never Clerk Account Portal via protect()'s default destination.
  if (!isPublicRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return redirectToAppSignIn(req);
    }
  }
});

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  if (!isClerkConfigured()) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      pruneRateLimitBuckets();
      const result = rateLimitOk(req);
      if (!result.ok) {
        return NextResponse.json(
          { error: "Too many requests. Try again shortly." },
          {
            status: 429,
            headers: {
              "Retry-After": String(
                Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000)),
              ),
              "X-RateLimit-Remaining": "0",
            },
          },
        );
      }
    }

    const path = req.nextUrl.pathname;
    const needsAuth =
      path.startsWith("/studio") ||
      path.startsWith("/api/studio") ||
      path.startsWith("/api/account");

    if (needsAuth) {
      return redirectToAppSignIn(req);
    }

    return NextResponse.next();
  }

  try {
    return await clerkHandler(req, event);
  } catch (error) {
    console.error("[middleware] Clerk invocation failed:", error);
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }
    return redirectToAppSignIn(req);
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
