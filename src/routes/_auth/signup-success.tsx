import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/signup-success")({
	validateSearch: (search) => ({
		email: (search?.email as string) || "",
	}),
	component: SignupSuccessComp,
});

function SignupSuccessComp() {
	const { email } = Route.useSearch();

	return (
		<div className="fixed inset-0 bg-white dark:bg-black flex items-start justify-center p-8">
			<div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg max-w-md">
				<div className="text-center">
					<div className="text-6xl mb-4">📧</div>
					<h1 className="text-2xl font-bold mb-4">Check your email!</h1>
					<div className="space-y-4 text-gray-600 dark:text-gray-300">
						<p>
							We've sent a confirmation email to{" "}
							<strong className="text-black dark:text-white">{email}</strong>
						</p>
						<p>
							Please check your inbox and click the confirmation link to
							activate your account.
						</p>
						<p className="text-sm">
							Don't see the email? Check your spam folder or try again in a few
							minutes.
						</p>
					</div>
					<div className="mt-8 space-y-4">
						<div className="text-center">
							<Link
								to="/login"
								className="text-blue-500 hover:underline text-sm"
							>
								← Back to Login
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
