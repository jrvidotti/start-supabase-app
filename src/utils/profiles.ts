import { createServerFn } from "@tanstack/react-start";
import type { Profile, NewProfile } from "~/db";
import { getSupabaseServerClient } from "~/utils/supabase";

export const createProfile = createServerFn({ method: "POST" })
	.validator((d: { user_id: string; name: string }) => d)
	.handler(async ({ data }) => {
		console.info(`Creating profile for user ${data.user_id}...`);
		const supabase = getSupabaseServerClient();

		const { data: newProfile, error } = await supabase
			.from("profiles")
			.insert({
				user_id: data.user_id,
				name: data.name.trim(),
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating profile:", error);
			throw new Error("Error creating profile");
		}

		return newProfile as Profile;
	});

export const getProfile = createServerFn({ method: "GET" })
	.validator((d: string) => d)
	.handler(async ({ data: userId }) => {
		console.info(`Fetching profile for user ${userId}...`);
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

export const ensureProfile = createServerFn({ method: "POST" })
	.validator((d: { user_id: string; name?: string }) => d)
	.handler(async ({ data }) => {
		console.info(`Ensuring profile exists for user ${data.user_id}...`);
		
		// Try to get existing profile first
		try {
			const profile = await getProfile({ data: data.user_id });
			if (profile) {
				return profile;
			}
		} catch (error) {
			// Continue to create profile if not found
		}

		// If no name provided, we can't create a profile
		// This is the case for existing users who don't have a profile yet
		if (!data.name) {
			return null;
		}

		// Create profile if it doesn't exist and we have a name
		return await createProfile({
			data: {
				user_id: data.user_id,
				name: data.name,
			},
		});
	});

export const updateProfile = createServerFn({ method: "POST" })
	.validator((d: { user_id: string; name: string }) => d)
	.handler(async ({ data }) => {
		console.info(`Updating profile for user ${data.user_id}...`);
		const supabase = getSupabaseServerClient();

		const { data: updatedProfile, error } = await supabase
			.from("profiles")
			.update({
				name: data.name.trim(),
				updated_at: new Date().toISOString(),
			})
			.eq("user_id", data.user_id)
			.select()
			.single();

		if (error) {
			console.error("Error updating profile:", error);
			throw new Error("Error updating profile");
		}

		return updatedProfile as Profile;
	});