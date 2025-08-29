import { Link } from "@tanstack/react-router";

export function SignupForm({
	onSubmit,
	status,
	afterSubmit,
}: {
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	status: "pending" | "idle" | "success" | "error";
	afterSubmit?: React.ReactNode;
}) {
	return (
		<div className="fixed inset-0 bg-white dark:bg-black flex items-start justify-center p-8">
			<div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
				<h1 className="text-2xl font-bold mb-4">Sign Up</h1>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSubmit(e);
					}}
					className="space-y-4"
				>
					<div>
						<label htmlFor="name" className="block text-xs">
							Full Name *
						</label>
						<input
							type="text"
							name="name"
							id="name"
							required
							className="px-2 py-1 w-full rounded border border-gray-500/20 bg-white dark:bg-gray-800"
							placeholder="Enter your full name"
						/>
					</div>
					<div>
						<label htmlFor="email" className="block text-xs">
							Email *
						</label>
						<input
							type="email"
							name="email"
							id="email"
							required
							className="px-2 py-1 w-full rounded border border-gray-500/20 bg-white dark:bg-gray-800"
							placeholder="Enter your email"
						/>
					</div>
					<div>
						<label htmlFor="password" className="block text-xs">
							Password *
						</label>
						<input
							type="password"
							name="password"
							id="password"
							required
							className="px-2 py-1 w-full rounded border border-gray-500/20 bg-white dark:bg-gray-800"
							placeholder="Create a password"
						/>
					</div>
					<button
						type="submit"
						className="w-full bg-cyan-600 text-white rounded py-2 font-black uppercase"
						disabled={status === "pending"}
					>
						{status === "pending" ? "Creating Account..." : "Sign Up"}
					</button>
					{afterSubmit ? afterSubmit : null}
				</form>
			</div>
		</div>
	);
}