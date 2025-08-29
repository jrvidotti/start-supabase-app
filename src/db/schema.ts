import { sql } from "drizzle-orm";
import {
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";

export const post_status = pgEnum("post_status", [
  "draft",
  "published",
  "archived",
]);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    body: text("body"),
    user_id: uuid("user_id"),
    status: post_status("status").default("draft").notNull(),
    featured_image: text("featured_image"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  () => [
    pgPolicy("posts_select_policy", {
      as: "permissive",
      for: "select",
      to: "public",
      using: sql`user_id = auth.uid() OR status = 'published'`,
    }),
    pgPolicy("posts_insert_policy", {
      as: "permissive",
      for: "insert",
      to: "public",
      withCheck: sql`user_id = auth.uid()`,
    }),
    pgPolicy("posts_update_policy", {
      as: "permissive",
      for: "update",
      to: "public",
      using: sql`user_id = auth.uid()`,
    }),
    pgPolicy("posts_delete_policy", {
      as: "permissive",
      for: "delete",
      to: "public",
      using: sql`user_id = auth.uid()`,
    }),
  ]
).enableRLS();

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("tags_name_unique").on(table.name),
    unique("tags_slug_unique").on(table.slug),
    pgPolicy("tags_select_policy", {
      as: "permissive",
      for: "select",
      to: "public",
      using: sql`true`,
    }),
    pgPolicy("tags_insert_policy", {
      as: "permissive",
      for: "insert",
      to: "public",
      withCheck: sql`true`,
    }),
    pgPolicy("tags_update_policy", {
      as: "permissive",
      for: "update",
      to: "public",
      using: sql`true`,
    }),
    pgPolicy("tags_delete_policy", {
      as: "permissive",
      for: "delete",
      to: "public",
      using: sql`true`,
    }),
  ]
).enableRLS();

export const posts_tags = pgTable(
  "posts_tags",
  {
    post_id: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tag_id: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.post_id, table.tag_id] }),
    pgPolicy("posts_tags_select_policy", {
      as: "permissive",
      for: "select",
      to: "public",
      using: sql`true`,
    }),
    pgPolicy("posts_tags_insert_policy", {
      as: "permissive",
      for: "insert",
      to: "public",
      withCheck: sql`true`,
    }),
    pgPolicy("posts_tags_delete_policy", {
      as: "permissive",
      for: "delete",
      to: "public",
      using: sql`true`,
    }),
  ]
).enableRLS();

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().unique("profiles_user_id_unique"),
    name: text("name"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    pgPolicy("profiles_select_policy", {
      as: "permissive",
      for: "select",
      to: "public",
      using: sql`user_id = auth.uid()`,
    }),
    pgPolicy("profiles_insert_policy", {
      as: "permissive",
      for: "insert",
      to: "public",
      withCheck: sql`user_id = auth.uid()`,
    }),
    pgPolicy("profiles_update_policy", {
      as: "permissive",
      for: "update",
      to: "public",
      using: sql`user_id = auth.uid()`,
    }),
    pgPolicy("profiles_delete_policy", {
      as: "permissive",
      for: "delete",
      to: "public",
      using: sql`user_id = auth.uid()`,
    }),
  ]
).enableRLS();

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type PostTag = typeof posts_tags.$inferSelect;
export type NewPostTag = typeof posts_tags.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type PostWithTags = Post & {
  tags: Tag[];
};
