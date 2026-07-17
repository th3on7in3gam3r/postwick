import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { pruneRateLimitBuckets, rateLimitOk } from "@/lib/rate-limit";

export function middleware(req: NextRequest) {
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

    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Remaining", String(result.remaining));
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
