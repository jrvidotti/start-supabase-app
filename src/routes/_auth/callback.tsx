import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { exchangeCodeFn } from "~/utils/auth";
import { useMutation } from "~/hooks/useMutation";

export const Route = createFileRoute("/_auth/callback")({
	validateSearch: (search: Record<string, unknown>) => ({
		code: search.code as string,
		error: search.error as string | undefined,
		error_description: search.error_description as string | undefined,
	}),
	component: CallbackComponent,
});

function CallbackComponent() {
	const router = useRouter();
	const { code, error, error_description } = useSearch({ from: "/_auth/callback" });

	const exchangeMutation = useMutation({
		fn: exchangeCodeFn,
		onSuccess: async (ctx) => {
			if (ctx.data?.success) {
				await router.invalidate();
				router.navigate({ to: "/" });
			}
		},
	});

	useEffect(() => {
		if (error) {
			console.error("OAuth error:", error, error_description);
			router.navigate({ to: "/login" });
			return;
		}

		if (code && exchangeMutation.status === "idle") {
			exchangeMutation.mutate({ data: { code } });
		}
	}, [code, error, error_description, exchangeMutation, router]);

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<div className="text-center">
					<h1 className="text-xl font-semibold text-destructive">Authentication Error</h1>
					<p className="text-muted-foreground mt-2">
						{error_description || "An error occurred during authentication"}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<div className="text-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
				<h1 className="text-xl font-semibold">Completing sign in...</h1>
				<p className="text-muted-foreground mt-2">Please wait while we finish logging you in.</p>
			</div>
		</div>
	);
}