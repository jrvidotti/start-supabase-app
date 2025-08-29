import { Link, useRouter } from "@tanstack/react-router";
import { useMutation } from "../hooks/useMutation";
import { loginFn } from "../utils/auth";
import { Auth } from "./Auth";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { AlertCircle } from "lucide-react";

export function Login() {
	const router = useRouter();

	const loginMutation = useMutation({
		fn: loginFn,
		onSuccess: async (ctx) => {
			if (!ctx.data?.error) {
				await router.invalidate();
				router.navigate({ to: "/" });
				return;
			}
		},
	});

	return (
		<Auth
			actionText="Login"
			status={loginMutation.status}
			onSubmit={(e) => {
				const formData = new FormData(e.target as HTMLFormElement);

				loginMutation.mutate({
					data: {
						email: formData.get("email") as string,
						password: formData.get("password") as string,
					},
				});
			}}
			afterSubmit={
				<div className="space-y-4">
					{loginMutation.data && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								{loginMutation.data.message}
							</AlertDescription>
						</Alert>
					)}
					{loginMutation.data?.error &&
						loginMutation.data.message === "Email not confirmed" && (
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								<p className="font-medium">Account not verified</p>
								<p className="text-sm">
									Please check your email and click the confirmation link to
									activate your account.
								</p>
							</AlertDescription>
						</Alert>
					)}
					<div className="text-center text-sm text-muted-foreground">
						Don't have an account?{" "}
						<Button asChild variant="link" className="p-0 h-auto">
							<Link to="/signup">Sign up</Link>
						</Button>
					</div>
				</div>
			}
		/>
	);
}
