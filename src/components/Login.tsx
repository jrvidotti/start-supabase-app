import { Link, useRouter } from "@tanstack/react-router";
import { useMutation } from "../hooks/useMutation";
import { loginFn } from "../utils/auth";
import { Auth } from "./Auth";

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
				<>
					{loginMutation.data ? (
						<>
							<div className="text-red-400">{loginMutation.data.message}</div>
							{loginMutation.data.error &&
							loginMutation.data.message === "Email not confirmed" ? (
								<div className="text-yellow-600 text-sm mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
									<p className="font-medium">Account not verified</p>
									<p>
										Please check your email and click the confirmation link to
										activate your account.
									</p>
								</div>
							) : null}
						</>
					) : null}
					<div className="text-center mt-4 text-sm">
						Don't have an account?{" "}
						<Link to="/signup" className="text-blue-500 hover:underline">
							Sign up
						</Link>
					</div>
				</>
			}
		/>
	);
}
