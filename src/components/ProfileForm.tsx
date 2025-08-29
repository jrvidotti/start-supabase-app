import { Link, useRouter } from "@tanstack/react-router";
import { useMutation } from "~/hooks/useMutation";
import { Route } from "~/routes/__root";
import { upsertProfile } from "~/utils/profiles";

export function ProfileForm() {
	const { user } = Route.useRouteContext();
	const router = useRouter();

	const updateMutation = useMutation({
		fn: upsertProfile,
		onSuccess: async () => {
			// Refresh the page to update user context
			await router.invalidate();
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const name = formData.get("name") as string;

		if (!user) {
			return;
		}

		updateMutation.mutate({
			data: {
				user_id: user.id,
				name: name.trim(),
			},
		});
	};

	if (!user) {
		return null;
	}

	return (
		<div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border dark:border-gray-700">
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Email
					</label>
					<input
						type="email"
						id="email"
						value={user.email}
						disabled
						className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
					/>
					<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
						Email cannot be changed
					</p>
				</div>

				<div>
					<label
						htmlFor="name"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Name
					</label>
					<input
						type="text"
						id="name"
						name="name"
						defaultValue={user.profile?.name || ""}
						required
						className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-800 dark:text-white"
						placeholder="Enter your name"
					/>
				</div>

				{updateMutation.error && (
					<div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
						<p className="text-sm text-red-600 dark:text-red-400">
							Error:{" "}
							{updateMutation.error instanceof Error
								? updateMutation.error.message
								: "Something went wrong"}
						</p>
					</div>
				)}

				{updateMutation.status === "success" && (
					<div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
						<p className="text-sm text-green-600 dark:text-green-400">
							Profile updated successfully!
						</p>
					</div>
				)}

				<div className="flex gap-3 pt-4">
					<button
						type="submit"
						disabled={updateMutation.status === "pending"}
						className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{updateMutation.status === "pending" ? "Saving..." : "Save Changes"}
					</button>

					<Link
						to="/my-posts"
						className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
					>
						Cancel
					</Link>
				</div>
			</form>
		</div>
	);
}
