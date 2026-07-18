import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
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
