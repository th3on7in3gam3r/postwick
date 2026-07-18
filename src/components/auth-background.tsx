import type { ReactNode } from "react";

/**
 * Clerk-dashboard-style ambient auth backdrop:
 * light gray base, drifting color blobs, honeycomb SVG overlay.
 */
export function AuthBackground({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell relative h-[100dvh] w-[100vw] overflow-hidden bg-[#e8eaed]">
      <div
        className="auth-blob auth-blob-a pointer-events-none absolute left-[-8%] top-[-12%] h-[500px] w-[600px] rounded-full opacity-55 blur-[90px]"
        aria-hidden
      />
      <div
        className="auth-blob auth-blob-b pointer-events-none absolute bottom-[-18%] right-[-10%] h-[480px] w-[550px] rounded-full opacity-55 blur-[90px]"
        aria-hidden
      />
      <div
        className="auth-blob auth-blob-c pointer-events-none absolute bottom-[-6%] left-[-4%] h-[320px] w-[380px] rounded-full opacity-30 blur-[90px]"
        aria-hidden
      />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="auth-hex"
            width="56"
            height="48.5"
            patternUnits="userSpaceOnUse"
          >
            {/* Flat-top hex; tile height ≈ 1.5 × flat-to-flat for honeycomb feel */}
            <path
              d="M14 0.5 L42 0.5 L56 24.25 L42 48 L14 48 L0 24.25 Z"
              fill="none"
              stroke="rgba(100,120,140,0.09)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-hex)" />
      </svg>

      <div className="relative z-10 flex min-h-[100dvh] w-full items-center justify-center px-4 py-8">
        {children}
      </div>
    </div>
  );
}
