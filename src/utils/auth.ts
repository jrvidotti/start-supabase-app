import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "~/utils/supabase";
import { createProfile } from "~/utils/profiles";

export const loginFn = createServerFn({ method: "POST" })
	.validator((d: { email: string; password: string }) => d)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password,
		});
		if (error) {
			return {
				error: true,
				message: error.message,
			};
		}
	});

export const signupFn = createServerFn({ method: "POST" })
	.validator(
		(d: { email: string; password: string; name: string; redirectUrl?: string }) => d,
	)
	.handler(
		async ({
			data,
		}): Promise<{
			success: boolean;
			needsConfirmation?: boolean;
			email?: string;
			error?: string;
		}> => {
			const supabase = getSupabaseServerClient();
			const { error, data: authData } = await supabase.auth.signUp({
				email: data.email,
				password: data.password,
			});
			if (error) {
				return {
					success: false,
					error: error.message,
				};
			}

			// Create profile if user was created successfully
			if (authData.user?.id && data.name) {
				try {
					await createProfile({
						data: {
							user_id: authData.user.id,
							name: data.name,
						},
					});
				} catch (profileError) {
					console.error("Error creating profile:", profileError);
					// Don't fail signup if profile creation fails
					// Profile will be created on login if missing
				}
			}

			// Return success status instead of redirecting
			return {
				success: true,
				needsConfirmation: !authData.user?.email_confirmed_at,
				email: data.email,
			};
		},
	);

export const exchangeCodeFn = createServerFn({ method: "POST" })
	.validator((d: { code: string }) => d)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { error } = await supabase.auth.exchangeCodeForSession(data.code);

		if (error) {
			return {
				error: true,
				message: error.message,
			};
		}

		return {
			success: true,
		};
	});
