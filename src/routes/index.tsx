import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { fetchPublicPosts } from "~/utils/posts";

export const Route = createFileRoute("/")({
	beforeLoad: async ({ search }) => {
		// biome-ignore lint/suspicious/noExplicitAny: ...
		const code = (search as any)?.code;

		// If there's a code parameter, redirect to the auth callback
		if (code) {
			throw redirect({
				to: "/auth/callback",
				search: { code },
			});
		}
	},
	loader: async () => ({ posts: await fetchPublicPosts() }),
	component: Home,
});

function Home() {
	const { posts } = Route.useLoaderData();
	return (
		<div className="p-4 max-w-4xl mx-auto">
			<div className="space-y-4">
				{posts.map((post) => (
					<Link
						key={post.id}
						to={`/posts/${post.id}`}
						className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
					>
						<h2 className="text-xl font-semibold mb-2">{post.title}</h2>
						{post.body && (
							<p className="text-gray-600 dark:text-gray-300 mb-3">
								{post.body.length > 150
									? `${post.body.substring(0, 150)}...`
									: post.body}
							</p>
						)}
						<p className="text-sm text-gray-500 dark:text-gray-400">
							📅 {new Date(post.created_at).toLocaleDateString("en-US")}
						</p>
					</Link>
				))}
			</div>
		</div>
	);
}
