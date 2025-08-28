import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { signupFn } from "~/utils/auth";
import { Auth } from "../../components/Auth";
import { useMutation } from "../../hooks/useMutation";

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
		<Auth
			actionText="Sign Up"
			status={signupMutation.status}
			onSubmit={(e) => {
				const formData = new FormData(e.target as HTMLFormElement);

				signupMutation.mutate({
					data: {
						email: formData.get("email") as string,
						password: formData.get("password") as string,
					},
				});
			}}
			afterSubmit={
				<>
					{signupMutation.data?.error ? (
						<div className="text-red-400">{signupMutation.data.message}</div>
					) : null}
					<div className="text-center mt-4 text-sm">
						Already have an account?{" "}
						<Link to="/login" className="text-blue-500 hover:underline">
							Login
						</Link>
					</div>
				</>
			}
		/>
	);
}
