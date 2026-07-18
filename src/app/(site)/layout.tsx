import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl bg-transparent px-5 pb-8 md:px-8">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
