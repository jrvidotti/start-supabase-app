import { createServerClient } from "@supabase/ssr";
import { parseCookies, setCookie } from "@tanstack/react-start/server";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

export function getSupabaseServerClient() {
  return createServerClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_ANON_KEY || "",
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
    }
  );
}
