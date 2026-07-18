import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { pruneRateLimitBuckets, rateLimitOk } from "@/lib/rate-limit";

const isPublicRoute = createRouteMatcher([
  "/",
  "/b/(.*)",
  "/privacy",
  "/terms",
  "/report",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/feed",
  "/api/health",
  "/robots.txt",
  "/sitemap.xml",
]);

function isClerkConfigured() {
  return Boolean(
    process.env.CLERK_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim(),
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

  if (!isPublicRoute(req)) {
    await auth().protect();
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
      const signIn = new URL("/sign-in", req.url);
      signIn.searchParams.set(
        "redirect_url",
        `${req.nextUrl.pathname}${req.nextUrl.search}`,
      );
      return NextResponse.redirect(signIn);
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
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set(
      "redirect_url",
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
    );
    return NextResponse.redirect(signIn);
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
