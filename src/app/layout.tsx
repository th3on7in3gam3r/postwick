import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, DM_Sans } from "next/font/google";
import Script from "next/script";
import { appUrl } from "@/lib/brand";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const siteDescription =
  "Discover local business posts shared from Kerygma Social — a public feed for brands that opt in.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: "Postwick",
    template: "%s · Postwick",
  },
  description: siteDescription,
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl(),
    siteName: "Postwick",
    title: "Postwick",
    description: siteDescription,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Postwick" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Postwick",
    description: siteDescription,
    images: ["/og.png"],
  },
};

function isClerkConfigured() {
  return Boolean(
    process.env.CLERK_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim(),
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} antialiased`}>
        {isClerkConfigured() ? (
          <ClerkProvider
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            signInFallbackRedirectUrl="/studio"
            signUpFallbackRedirectUrl="/studio"
            localization={{
              signIn: {
                start: {
                  title: "Sign in to Postwick",
                },
              },
              signUp: {
                start: {
                  title: "Create your Postwick account",
                },
              },
            }}
          >
            {children}
          </ClerkProvider>
        ) : (
          children
        )}
        <Script
          src="https://pulse-5o1m.onrender.com/pulse.js"
          strategy="afterInteractive"
          data-site="postwick-vercel-app"
        />
      </body>
    </html>
  );
}
