CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "profiles_select_policy" ON "profiles" AS PERMISSIVE FOR SELECT TO public USING (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "profiles_insert_policy" ON "profiles" AS PERMISSIVE FOR INSERT TO public WITH CHECK (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "profiles_update_policy" ON "profiles" AS PERMISSIVE FOR UPDATE TO public USING (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "profiles_delete_policy" ON "profiles" AS PERMISSIVE FOR DELETE TO public USING (user_id = auth.uid());