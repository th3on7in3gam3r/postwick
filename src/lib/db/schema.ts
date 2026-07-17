import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Read-only mirror of Kerygma public brand columns. */
export const brands = pgTable("brands", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  websiteUrl: text("website_url").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(false),
  publicSlug: text("public_slug"),
  publicNiche: text("public_niche"),
});

/** Read-only mirror of Kerygma public post columns. */
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
});
