import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { signupFn } from "~/utils/auth";
import { SignupForm } from "../../components/SignupForm";
import { useMutation } from "../../hooks/useMutation";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_auth/signup")({
	component: SignupComp,
});

function SignupComp() {
	const router = useRouter();

	const signupMutation = useMutation({
		fn: signupFn,
		onSuccess: async (ctx) => {
			if (ctx.data?.success && ctx.data.email) {
				// Redirect to success page with email
				router.navigate({
					to: "/signup-success",
					search: { email: ctx.data.email },
				});
			}
		},
	});

	return (
		<SignupForm
			status={signupMutation.status}
			onSubmit={(e) => {
				const formData = new FormData(e.target as HTMLFormElement);

				signupMutation.mutate({
					data: {
						email: (formData.get("email") as string).trim(),
						password: formData.get("password") as string,
						name: (formData.get("name") as string).trim(),
					},
				});
			}}
			afterSubmit={
				<div className="space-y-4">
					{signupMutation.data?.error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								{signupMutation.data.error}
							</AlertDescription>
						</Alert>
					)}
					<div className="text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Button asChild variant="link" className="p-0 h-auto">
							<Link to="/login">Login</Link>
						</Button>
					</div>
				</div>
			}
		/>
	);
}
