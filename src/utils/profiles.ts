import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "~/utils/supabase";
import { Database } from "~/utils/supabase-types.gen";

export type ProfileUpsert =
  Database["public"]["Tables"]["profiles"]["Update"] & {
    user_id: string;
  };

export const getProfile = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data: userId }) => {
    const supabase = getSupabaseServerClient();

    const { data: profile, error } = await supabase
      .schema("public")
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No profile found, return null
        return null;
      }
      console.error("Error fetching profile:", error);
      throw new Error("Error fetching profile");
    }

    return profile;
  });

export const upsertProfile = createServerFn({ method: "POST" })
  .validator((d: ProfileUpsert) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    const { data: profile, error } = await supabase
      .schema("public")
      .from("profiles")
      .upsert(
        {
          user_id: data.user_id,
          name: data.name?.trim(),
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error upserting profile:", error);
      throw new Error("Error upserting profile");
    }

    return profile;
  });

export const ensureProfile = createServerFn({ method: "POST" })
  .validator((d: ProfileUpsert) => d)
  .handler(async ({ data }) => {
    try {
      const profile = await getProfile({ data: data.user_id });
      return await upsertProfile({
        data: {
          user_id: data.user_id,
          name: profile?.name ? undefined : data.name,
        },
      });
    } catch (_error) {
      console.error("Error getting profile:", _error);
      return null;
    }
  });
