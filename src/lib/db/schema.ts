import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  date,
} from "drizzle-orm/pg-core";

/** Shared with Kerygma — public brand columns. */
export const brands = pgTable("brands", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  websiteUrl: text("website_url").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(false),
  publicSlug: text("public_slug"),
  publicNiche: text("public_niche"),
  publicCity: text("public_city"),
});

/** Shared with Kerygma — public post columns. */
export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  brandId: text("brand_id")
    .notNull()
    .references(() => brands.id),
  platform: text("platform").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"),
  publishedAt: timestamp("published_at", { withTimezone: true, mode: "string" }),
  isPublic: boolean("is_public").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});

export const postwickClaimCodes = pgTable(
  "postwick_claim_codes",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    userId: text("user_id").notNull(),
    brandId: text("brand_id"),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    codeIdx: uniqueIndex("postwick_claim_codes_code_idx").on(table.code),
  }),
);

export const postwickAccounts = pgTable(
  "postwick_accounts",
  {
    id: text("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    kerygmaUserId: text("kerygma_user_id").notNull(),
    username: text("username"),
    brandIds: text("brand_ids").notNull().default("[]"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    clerkUserIdx: uniqueIndex("postwick_accounts_clerk_user_id_idx").on(
      table.clerkUserId,
    ),
    kerygmaUserIdx: uniqueIndex("postwick_accounts_kerygma_user_id_idx").on(
      table.kerygmaUserId,
    ),
    usernameIdx: uniqueIndex("postwick_accounts_username_idx").on(table.username),
  }),
);

/** Aggregated public views (no PII). */
export const postwickPageViews = pgTable(
  "postwick_page_views",
  {
    id: text("id").primaryKey(),
    brandId: text("brand_id").notNull(),
    postId: text("post_id"),
    path: text("path").notNull(),
    viewedOn: date("viewed_on", { mode: "string" }).notNull(),
    count: integer("count").notNull().default(1),
  },
  (table) => ({
    dayIdx: uniqueIndex("postwick_page_views_day_idx").on(
      table.brandId,
      table.postId,
      table.path,
      table.viewedOn,
    ),
  }),
);

/** Partner API keys for Cadence / growth-stack (hash only stored). */
export const postwickApiKeys = pgTable(
  "postwick_api_keys",
  {
    id: text("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    name: text("name").notNull().default("Cadence"),
    keyPrefix: text("key_prefix").notNull(),
    keyHash: text("key_hash").notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true, mode: "string" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    keyHashIdx: uniqueIndex("postwick_api_keys_key_hash_idx").on(table.keyHash),
  }),
);
