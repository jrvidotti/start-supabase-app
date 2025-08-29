import { createServerFn } from "@tanstack/react-start";
import type { NewProfile, Profile } from "~/db";
import { getSupabaseServerClient } from "~/utils/supabase";

export const getProfile = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data: userId }) => {
    const supabase = getSupabaseServerClient();

    const { data: profile, error } = await supabase
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

    return profile as Profile;
  });

export const upsertProfile = createServerFn({ method: "POST" })
  .validator((d: NewProfile) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    const { data: profile, error } = await supabase
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

    return profile as Profile;
  });

export const ensureProfile = createServerFn({ method: "POST" })
  .validator((d: NewProfile & { name?: string }) => d)
  .handler(async ({ data }) => {
    try {
      const profile = await getProfile({ data: data.user_id });
      return await upsertProfile({
        data: {
          user_id: data.user_id,
          // if profile name exists, don't update name
          name: profile?.name ? undefined : data.name,
        },
      });
    } catch (_error) {
      console.error("Error getting profile:", _error);
      return null;
    }
  });
