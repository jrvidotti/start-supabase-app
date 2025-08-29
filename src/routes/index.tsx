import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { TagsList } from "~/components/TagsList";
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
						to="/posts/$postId"
						params={{ postId: post.id }}
						className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
					>
						<div className="flex gap-4">
							{post.featured_image && (
								<div className="flex-shrink-0">
									<img
										src={post.featured_image}
										alt={post.title}
										className="w-24 h-24 object-cover rounded-lg"
									/>
								</div>
							)}
							<div className="flex-1">
								<h2 className="text-xl font-semibold mb-2">{post.title}</h2>
								{post.body && (
									<p className="text-gray-600 dark:text-gray-300 mb-3">
										{post.body.length > 150
											? `${post.body.substring(0, 150)}...`
											: post.body}
									</p>
								)}
								<div className="flex items-center justify-between">
									<div>
										<TagsList tags={post.tags || []} />
									</div>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										📅 {new Date(post.created_at).toLocaleDateString("en-US")}
									</p>
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
