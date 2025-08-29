import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { parseCookies, setCookie } from "@tanstack/react-start/server";

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
	throw new Error("Missing Supabase environment variables");
}

if (!process.env.SUPABASE_SECRET_KEY) {
	console.warn("SUPABASE_SECRET_KEY not found. Admin operations may not work.");
}

export function getSupabaseServerClient() {
	return createServerClient(
		process.env.VITE_SUPABASE_URL || "",
		process.env.VITE_SUPABASE_ANON_KEY || "",
		{
			cookies: {
				getAll() {
					return Object.entries(parseCookies()).map(([name, value]) => ({
						name,
						value,
					}));
				},
				setAll(cookies) {
					cookies.forEach((cookie) => {
						setCookie(cookie.name, cookie.value);
					});
				},
			},
		},
	);
}

// Admin client with service role key - bypasses RLS
// WARNING: Only use for administrative operations!
export function getSupabaseAdminClient() {
	if (!process.env.SUPABASE_SECRET_KEY) {
		throw new Error("SUPABASE_SECRET_KEY is required for admin operations");
	}

	// Use regular createClient for admin operations (no SSR cookies needed)
	return createClient(
		process.env.VITE_SUPABASE_URL || "",
		process.env.SUPABASE_SECRET_KEY || "",
	);
}
