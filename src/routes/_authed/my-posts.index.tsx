import { createFileRoute, Link } from "@tanstack/react-router";
export const Route = createFileRoute("/_authed/my-posts/")({
	component: PostsIndexComponent,
});

function PostsIndexComponent() {
	return (
		<div className="p-4 text-center">
			<div className="text-gray-600 dark:text-gray-300 mb-6">
				<h2 className="text-lg font-semibold mb-2">Welcome to your posts!</h2>
				<p>Select a post from the list to edit it, or create a new one to get started.</p>
			</div>
			
			<Link
				to="/my-posts/new"
				className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
			>
				Create Your First Post
			</Link>
		</div>
	);
}
