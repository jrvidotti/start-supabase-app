import { sql } from "drizzle-orm";
import {
	pgEnum,
	pgPolicy,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const postStatus = pgEnum("post_status", [
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
		userId: uuid("user_id"),
		status: postStatus("status").default("draft").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
	],
).enableRLS();

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
