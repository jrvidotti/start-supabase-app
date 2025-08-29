import { createServerFn } from "@tanstack/react-start";
import { ensureProfile, upsertProfile } from "~/utils/profiles";
import { getSupabaseServerClient } from "~/utils/supabase";

export const loginFn = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error, data: authData } = await supabase.auth.signInWithPassword({
      email: data.email.trim(),
      password: data.password,
    });
    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }

    await ensureProfile({
      data: {
        user_id: authData.user.id,
      },
    });
  });

export const signupFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      email: string;
      password: string;
      name: string;
      redirectUrl?: string;
    }) => d
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
        email: data.email.trim(),
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
          await upsertProfile({
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
    }
  );

const getURL = () => {
  let url =
    process.env.VITE_SITE_URL ?? // Set this to your site URL in production env.
    process.env.VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";

  // Make sure to include `https://` when not localhost.
  url = url.startsWith("http") ? url : `https://${url}`;

  // Make sure to include a trailing `/`.
  url = url.endsWith("/") ? url : `${url}/`;

  return url;
};

export const googleAuthFn = createServerFn({ method: "POST" })
  .validator((d: { redirectTo?: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    console.log("googleAuthFn data", data);

    const redirectTo = data.redirectTo || getURL();

    console.log("googleAuthFn redirectTo", redirectTo);

    const { data: authData, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }

    return {
      success: true,
      url: authData.url,
    };
  });

export const exchangeCodeFn = createServerFn({ method: "POST" })
  .validator((d: { code: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error, data: authData } =
      await supabase.auth.exchangeCodeForSession(data.code);

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
