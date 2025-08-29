import { createFileRoute } from "@tanstack/react-router";
import { ProfileForm } from "~/components/ProfileForm";

export const Route = createFileRoute("/_authed/profile")({
	component: Profile,
});

function Profile() {
	return (
		<div className="p-4 max-w-2xl mx-auto">
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Profile Settings
					</h1>
					<p className="text-gray-600 dark:text-gray-300 mt-1">
						Update your profile information
					</p>
				</div>
				<ProfileForm />
			</div>
		</div>
	);
}
