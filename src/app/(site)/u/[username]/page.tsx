import { notFound, redirect } from "next/navigation";
import { getPublicBrandSlugByUsername } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { username: string };
};

export default async function UsernameRedirectPage({ params }: PageProps) {
  const raw = decodeURIComponent(params.username || "").replace(/^@/, "");
  const slug = await getPublicBrandSlugByUsername(raw);
  if (!slug) notFound();
  redirect(`/b/${slug}`);
}
