CREATE TYPE "public"."post_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "status" "post_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
CREATE POLICY "posts_select_policy" ON "posts" AS PERMISSIVE FOR SELECT TO public USING (user_id = auth.uid() OR status = 'published');--> statement-breakpoint
CREATE POLICY "posts_insert_policy" ON "posts" AS PERMISSIVE FOR INSERT TO public WITH CHECK (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "posts_update_policy" ON "posts" AS PERMISSIVE FOR UPDATE TO public USING (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "posts_delete_policy" ON "posts" AS PERMISSIVE FOR DELETE TO public USING (user_id = auth.uid());