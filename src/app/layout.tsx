import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
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

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: "Postwick",
    template: "%s · Postwick",
  },
  description:
    "Discover local business posts shared from Kerygma Social — a public feed for brands that opt in.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} antialiased`}>
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-5 pb-8 md:px-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
