"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PostwickAccount, StudioBrand, StudioPost, StudioViewsSummary } from "@/lib/db";
import { kerygmaUrl } from "@/lib/brand";
import { AddBrandClaimForm } from "@/components/studio/add-brand-claim-form";

export function StudioDashboard({
  account,
  brands,
  posts: initialPosts,
  views,
}: {
  account: PostwickAccount;
  brands: StudioBrand[];
  posts: StudioPost[];
  views: StudioViewsSummary[];
}) {
  const router = useRouter();
  const [username, setUsername] = useState(account.username ?? "");
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [postError, setPostError] = useState<string | null>(null);
  const [postMessage, setPostMessage] = useState<string | null>(null);
  const [savingPostId, setSavingPostId] = useState<string | null>(null);

  const hasUsername = Boolean(account.username?.trim());
  const firstBrandSlug =
    brands.find((brand) => brand.publicSlug)?.publicSlug ?? null;

  async function saveUsername(event: React.FormEvent) {
    event.preventDefault();
    setUsernameError(null);
    setUsernameMessage(null);
    setUsernameSaving(true);
    try {
      const response = await fetch("/api/studio/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = (await response.json()) as {
        error?: string;
        account?: { username: string | null };
      };
      if (!response.ok) {
        setUsernameError(data.error || "Could not save username.");
        return;
      }
      setUsername(data.account?.username ?? username);
      setUsernameMessage("Username saved. It will show on your brand page.");
      router.refresh();
    } catch {
      setUsernameError("Could not save username. Try again.");
    } finally {
      setUsernameSaving(false);
    }
  }

  function startEdit(post: StudioPost) {
    setEditingId(post.id);
    setDraft(post.content);
    setPostError(null);
  }

  async function saveCaption(postId: string) {
    setPostError(null);
    setPostMessage(null);
    setSavingPostId(postId);
    try {
      const response = await fetch(`/api/studio/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });
      const data = (await response.json()) as {
        error?: string;
        post?: StudioPost;
      };
      if (!response.ok || !data.post) {
        setPostError(data.error || "Could not update caption.");
        return;
      }
      setPosts((prev) =>
        prev.map((item) => (item.id === postId ? data.post! : item)),
      );
      setEditingId(null);
      const slug = data.post.brandSlug;
      setPostMessage(
        slug
          ? "Caption saved. Check the public brand page to confirm the feed updated."
          : "Caption saved.",
      );
      router.refresh();
    } catch {
      setPostError("Could not update caption. Try again.");
    } finally {
      setSavingPostId(null);
    }
  }

  async function unshare(postId: string) {
    setPostError(null);
    setSavingPostId(postId);
    try {
      const response = await fetch(`/api/studio/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: false }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setPostError(data.error || "Could not unshare post.");
        return;
      }
      setPosts((prev) => prev.filter((item) => item.id !== postId));
      setEditingId(null);
      router.refresh();
    } catch {
      setPostError("Could not unshare post. Try again.");
    } finally {
      setSavingPostId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-ink/8 bg-white/80 p-6 shadow-soft md:p-8">
        <h2 className="font-display text-xl text-ink">Claim path checklist</h2>
        <p className="mt-1 text-sm text-slate">
          Confirm the owner loop end to end — claim code, username, then a
          caption edit that shows on Home.
        </p>
        <ol className="mt-4 space-y-2 text-sm text-ink">
          <li className="flex gap-2">
            <span className="text-accent" aria-hidden>
              ✓
            </span>
            <span>
              Linked via Kerygma claim code
              {brands.length > 0
                ? ` (${brands.length} brand${brands.length === 1 ? "" : "s"})`
                : ""}
            </span>
          </li>
          <li className="flex gap-2">
            <span className={hasUsername ? "text-accent" : "text-slate"} aria-hidden>
              {hasUsername ? "✓" : "○"}
            </span>
            <span>
              {hasUsername ? (
                <>
                  Display username set as{" "}
                  <span className="font-medium">@{account.username}</span>
                </>
              ) : (
                "Set a display username below"
              )}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate" aria-hidden>
              ○
            </span>
            <span>
              Edit one shared caption below, then open{" "}
              {firstBrandSlug ? (
                <Link
                  href={`/b/${firstBrandSlug}`}
                  className="font-medium text-ink underline-offset-2 hover:underline"
                >
                  your public brand page
                </Link>
              ) : (
                "Home"
              )}{" "}
              to confirm it updated.
            </span>
          </li>
        </ol>
        {firstBrandSlug ? (
          <p className="mt-4 text-sm">
            <Link
              href={`/b/${firstBrandSlug}`}
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              View public page →
            </Link>
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-ink/8 bg-white/80 p-6 shadow-soft md:p-8">
        <h2 className="font-display text-xl text-ink">Display username</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate">
          Your public <span className="font-medium text-ink">@handle</span> as
          the owner — shown next to brand names on Postwick. This is not your
          brand name (that comes from Kerygma below).
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate/90">
          Use 3–24 characters: letters, numbers, and underscores only (no
          spaces). Example:{" "}
          <code className="rounded bg-fog px-1.5 py-0.5 text-ink">
            biblefunland_studios
          </code>
        </p>
        <form
          onSubmit={saveUsername}
          className="mt-4 flex max-w-md flex-wrap items-end gap-3"
        >
          <label className="min-w-[12rem] flex-1 text-xs font-medium uppercase tracking-wide text-slate">
            Username
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-sm text-slate" aria-hidden>
                @
              </span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="your_handle"
                className="w-full rounded-xl border border-ink/15 bg-fog px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
                minLength={3}
                maxLength={24}
                pattern="[A-Za-z0-9_]+"
                title="Letters, numbers, and underscores only (3–24 characters)"
              />
            </div>
          </label>
          <button
            type="submit"
            disabled={usernameSaving}
            className="rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-fog disabled:opacity-60"
          >
            {usernameSaving ? "Saving…" : "Save"}
          </button>
        </form>
        {usernameError ? (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {usernameError}
          </p>
        ) : null}
        {usernameMessage ? (
          <p className="mt-2 text-sm text-accent" role="status">
            {usernameMessage}
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-ink/8 bg-white/80 p-6 shadow-soft md:p-8">
        <h2 className="font-display text-xl text-ink">Linked brands</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate">
          These are your Kerygma businesses linked via the claim code — each has
          its own public Postwick page. Your username above is separate from
          these brand names.
        </p>
        {brands.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink/15 bg-fog/50 px-4 py-6 text-sm text-slate">
            <p className="font-medium text-ink">No brands linked yet</p>
            <p className="mt-1 leading-relaxed">
              Your claim code did not attach any Kerygma brands. Generate a new
              code from the brand’s Postwick card in Kerygma Integrations, then
              contact support if this persists.
            </p>
            <a
              href={`${kerygmaUrl()}/settings/integrations`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex font-medium text-ink underline-offset-2 hover:underline"
            >
              Open Kerygma integrations
            </a>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {brands.map((brand) => (
              <li
                key={brand.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/5 py-2 text-sm last:border-0"
              >
                <span className="font-medium text-ink">{brand.name}</span>
                {brand.publicSlug ? (
                  <Link
                    href={`/b/${brand.publicSlug}`}
                    className="text-slate underline-offset-2 hover:text-ink hover:underline"
                  >
                    /b/{brand.publicSlug}
                  </Link>
                ) : (
                  <span className="text-slate">Not listed publicly</span>
                )}
              </li>
            ))}
          </ul>
        )}
        <AddBrandClaimForm />
      </section>

      <section className="rounded-3xl border border-ink/8 bg-white/80 p-6 shadow-soft md:p-8">
        <h2 className="font-display text-xl text-ink">Views</h2>
        <p className="mt-1 text-sm text-slate">
          Public page views on Postwick (no visitor identity). Totals refresh as
          people open your brand pages.
        </p>
        {views.length === 0 ? (
          <p className="mt-4 text-sm text-slate">No view data yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {views.map((row) => (
              <li
                key={row.brandId}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/5 py-2 text-sm last:border-0"
              >
                <span className="font-medium text-ink">{row.brandName}</span>
                <span className="text-slate">
                  {row.last7} (7d) · {row.last30} (30d)
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-ink/8 bg-white/80 p-6 shadow-soft md:p-8">
        <h2 className="font-display text-xl text-ink">Shared posts</h2>
        <p className="mt-1 text-sm text-slate">
          Edit captions or remove posts from the public Postwick feed. After
          saving, open the brand page to confirm Home shows the new text.
        </p>
        {postError ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {postError}
          </p>
        ) : null}
        {postMessage ? (
          <p className="mt-3 text-sm text-accent" role="status">
            {postMessage}{" "}
            {firstBrandSlug ? (
              <Link
                href={`/b/${firstBrandSlug}`}
                className="font-medium underline-offset-2 hover:underline"
              >
                Open brand page
              </Link>
            ) : null}
          </p>
        ) : null}
        {posts.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink/15 bg-fog/50 px-4 py-6 text-sm text-slate">
            <p className="font-medium text-ink">No shared posts yet</p>
            <p className="mt-1 leading-relaxed">
              Share published posts from Kerygma History, or use “Share all
              published posts” on the Postwick integrations card. New publishes
              auto-share when that connection is on.
            </p>
            <a
              href={`${kerygmaUrl()}/settings/integrations`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex font-medium text-ink underline-offset-2 hover:underline"
            >
              Open Kerygma integrations
            </a>
          </div>
        ) : (
          <ul className="mt-5 space-y-5">
            {posts.map((post) => (
              <li
                key={post.id}
                className="rounded-2xl border border-ink/8 bg-fog/60 p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate">
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 font-medium uppercase tracking-wide text-accent">
                    {post.platform}
                  </span>
                  <span>{post.brandName}</span>
                </div>
                {editingId === post.id ? (
                  <div className="mt-3 space-y-3">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={savingPostId === post.id}
                        onClick={() => void saveCaption(post.id)}
                        className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-fog disabled:opacity-60"
                      >
                        {savingPostId === post.id ? "Saving…" : "Save caption"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
                      {post.content}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(post)}
                        className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink hover:border-ink/30"
                      >
                        Edit caption
                      </button>
                      {post.brandSlug ? (
                        <Link
                          href={`/b/${post.brandSlug}`}
                          className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-slate hover:border-ink/30 hover:text-ink"
                        >
                          View on Postwick
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        disabled={savingPostId === post.id}
                        onClick={() => void unshare(post.id)}
                        className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-slate hover:border-ink/30 hover:text-ink disabled:opacity-60"
                      >
                        {savingPostId === post.id ? "…" : "Unshare"}
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
