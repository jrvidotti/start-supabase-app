/// <reference types="vite/client" />
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import type * as React from "react";
import { DefaultCatchBoundary } from "../components/DefaultCatchBoundary";
import { NotFound } from "../components/NotFound";
import { ThemeProvider } from "../components/theme-provider";
import { ThemeToggle } from "../components/theme-toggle";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Toaster } from "../components/ui/sonner";
import { Share2 } from "lucide-react";
import appCss from "../styles/app.css?url";
import { ensureProfile } from "../utils/profiles";
import { seo } from "../utils/seo";
import { getSupabaseServerClient } from "../utils/supabase";

const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data, error: _error } = await supabase.auth.getUser();

  if (!data.user?.email) {
    return null;
  }

  // Extract name from user metadata (for OAuth providers like Google)
  const name = data.user.user_metadata?.full_name as string | undefined;
  const avatarUrl = data.user.user_metadata?.avatar_url as string | undefined;

  const profile = await ensureProfile({
    data: {
      user_id: data.user.id,
      name: name,
    },
  });

  return {
    id: data.user.id,
    email: data.user.email,
    profile,
    avatarUrl,
  };
});

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await fetchUser();

    return {
      user,
    };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "ShareSpace | Share Your Thoughts and Connect",
        description: "ShareSpace - A modern platform for sharing posts, connecting with others, and building communities.",
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ThemeProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { user } = Route.useRouteContext();

  console.log("user", user);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
							try {
								const stored = localStorage.getItem('theme');
								if (stored) {
									document.documentElement.classList.toggle('dark', stored === 'dark');
								} else {
									const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;
									document.documentElement.classList.toggle('dark', isDarkSystem);
								}
							} catch (e) {}
						`,
          }}
        />
      </head>
      <body>
        <div className="min-h-screen bg-background">
          <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center space-x-6">
                <Link
                  to="/"
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <Share2 className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold text-foreground">ShareSpace</span>
                </Link>
                
                <div className="flex items-center space-x-4">
                  <Link
                    to="/"
                    activeProps={{
                      className: "font-semibold text-primary",
                    }}
                    activeOptions={{ exact: true }}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                  {user && (
                    <Link
                      to="/my-posts"
                      activeProps={{
                        className: "font-semibold text-primary",
                      }}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      My Posts
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <ThemeToggle />
                {user ? (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="bg-primary/10">
                          {user.profile?.name
                            ? user.profile.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()
                            : user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {user.profile?.name || user.email}
                      </span>
                    </Link>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/logout">Logout</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </nav>

          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
